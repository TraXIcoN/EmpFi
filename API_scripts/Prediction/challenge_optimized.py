from http.client import HTTPException
import numpy as np
import pandas as pd
import geopandas as gpd
import requests
from shapely.geometry import Point, LineString
import matplotlib.pyplot as plt
from sklearn.neighbors import BallTree
import osmnx as ox
import os
from shapely.ops import nearest_points
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
from functools import lru_cache
from sklearn.preprocessing import RobustScaler
from scipy import stats
import folium
from branca.colormap import LinearColormap
import json
from datetime import datetime
from typing import Dict, List
import time

# Step 1: Load the Traffic Dataset from CSV
print("Loading traffic data from CSV...")
csv_path = "./API_scripts/Prediction/traffic_data_sample.csv"
if os.path.exists(csv_path):
    print("[INFO] Loading traffic data from CSV...")
    traffic_csv = pd.read_csv(csv_path)
    print("[DEBUG] Traffic CSV Columns:", traffic_csv.columns)
    if "wkt_geom" in traffic_csv.columns:
        traffic_gdf = gpd.GeoDataFrame(traffic_csv, geometry=gpd.GeoSeries.from_wkt(traffic_csv["wkt_geom"]), crs="EPSG:4326")
    elif "geometry" in traffic_csv.columns:
        traffic_gdf = gpd.GeoDataFrame(traffic_csv, geometry=gpd.GeoSeries.from_wkt(traffic_csv["geometry"]), crs="EPSG:4326")
    else:
        raise ValueError("[ERROR] No valid geometry column ('wkt_geom' or 'geometry') found in CSV.")
else:
    raise FileNotFoundError("[ERROR] Traffic data CSV file not found.")

# Step 2.5: Fetch Storefront Data using Google Places API
print("Fetching storefront locations from Google Places API...")
def get_storefronts():
    api_key = "AIzaSyDEkpMrCWhkpSwREmAjUS5BARF8kLlyo58"
    location = "33.7490,-84.3880"  # Atlanta, GA (Example)
    radius = 5000  # 5 km
    query = "storefronts"
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={query}&location={location}&radius={radius}&key={api_key}"
    response = requests.get(url).json()
    stores = []
    for result in response.get("results", []):
        lat, lon = result["geometry"]["location"].values()
        stores.append(Point(lon, lat))
    print(f"[INFO] Retrieved {len(stores)} storefronts from Google Places API")
    return gpd.GeoDataFrame(geometry=stores, crs="EPSG:4326")

gdf_storefronts = get_storefronts()
print("Storefront data loaded successfully.")

# Step 3: Compute Storefront Impressions with Improved Visibility Scoring

def compute_visibility_factor(segment, storefront_location):
    factor = 1.0
    
    # Enhanced road type weighting with more granular categories
    road_type_weights = {
        "motorway": 2.0,
        "motorway_link": 1.8,
        "trunk": 1.8,
        "trunk_link": 1.6,
        "primary": 1.6,
        "primary_link": 1.4,
        "secondary": 1.4,
        "secondary_link": 1.2,
        "tertiary": 1.2,
        "tertiary_link": 1.0,
        "residential": 1.0,
        "service": 0.8,
        "living_street": 0.7,
        "unclassified": 0.9
    }
    highway_type = segment.get("highway", "unclassified")
    factor *= road_type_weights.get(highway_type, 1.0)
    
    # Enhanced directional impact with traffic flow consideration
    direction_weights = {
        1: 1.3,  # With geometry direction - increased visibility
        2: 0.9,  # Against geometry - slightly reduced
        3: 1.6   # Bidirectional - maximum visibility
    }
    factor *= direction_weights.get(segment["match_dir"], 1.0)
    
    if isinstance(segment["geometry"], LineString):
        # Enhanced visibility calculation
        line = LineString([segment["geometry"].coords[0], segment["geometry"].coords[-1]])
        point = storefront_location.geometry.iloc[0]
        
        # Improved segment length consideration
        segment_length = segment.get("segment_length_m", line.length)
        
        # Multi-factor visibility model
        perpendicular_distance = point.distance(line)
        angle = abs(np.degrees(np.arctan2(
            line.coords[-1][1] - line.coords[0][1],
            line.coords[-1][0] - line.coords[0][0]
        )))
        
        # Distance decay with multiple thresholds
        near_threshold = 50  # meters
        far_threshold = 150  # meters
        if perpendicular_distance <= near_threshold:
            visibility_decay = 1.0
        elif perpendicular_distance <= far_threshold:
            visibility_decay = 1.0 - ((perpendicular_distance - near_threshold) / (far_threshold - near_threshold))
        else:
            visibility_decay = 0.0
        
        # Angle impact on visibility
        angle_factor = np.cos(np.radians(angle)) * 0.5 + 0.5  # Normalize to 0.5-1.0 range
        
        factor *= visibility_decay * angle_factor
        
        # Length-based exposure time (with diminishing returns)
        duration_factor = np.cbrt(segment_length / 100)  # Cube root for diminishing returns
        factor *= duration_factor

    return factor

class StorefrontAnalyzer:
    def __init__(self):
        self.google_api_key = "AIzaSyDEkpMrCWhkpSwREmAjUS5BARF8kLlyo58"
        self.results_path = "./API_scripts/Prediction/results/"
        os.makedirs(self.results_path, exist_ok=True)
    
    def fetch_building_data(self, lat: float, lon: float, radius: int = 500) -> Dict:
        """Fetch nearby buildings using Google Places API"""
        url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            "location": f"{lat},{lon}",
            "radius": radius,
            "type": "building",
            "key": self.google_api_key
        }
        response = requests.get(url, params=params)
        return response.json()
    
    def get_building_height(self, place_id: str) -> float:
        """Get building height from Google Places API (if available)"""
        url = f"https://maps.googleapis.com/maps/api/place/details/json"
        params = {
            "place_id": place_id,
            "fields": "height",
            "key": self.google_api_key
        }
        response = requests.get(url, params=params)
        details = response.json()
        return details.get("result", {}).get("height", 10.0)  # Default height if not available

    def save_analysis_results(self, storefront_location, impression_score, nearby_buildings=None):
        """Save analysis results for web visualization"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        result = {
            "timestamp": timestamp,
            "location": {
                "lat": float(storefront_location.y),
                "lon": float(storefront_location.x)
            },
            "impression_score": float(impression_score),
            "nearby_roads": self._get_nearby_roads(storefront_location),
            "buildings": nearby_buildings or [],
            "traffic_data": self._get_traffic_data(storefront_location)
        }
        
        filename = f"{self.results_path}analysis_{timestamp}.json"
        with open(filename, 'w') as f:
            json.dump(result, f, indent=2)
        return filename

    def _get_nearby_roads(self, location, radius=150):
        """Extract nearby road segments for visualization"""
        if not isinstance(location, Point):
            raise ValueError("Location must be a Point geometry")
        
        nearby_roads = []
        traffic_gdf_projected = traffic_gdf.to_crs(epsg=3857)
        location_projected = gpd.GeoDataFrame(geometry=[location], crs="EPSG:4326").to_crs(epsg=3857).geometry.iloc[0]
        
        for _, road in traffic_gdf_projected.iterrows():
            if road.geometry.distance(location_projected) <= radius:
                coords = [(float(y), float(x)) for x, y in road.geometry.coords]
                nearby_roads.append({
                    "coords": coords,
                    "highway_type": road["highway"],
                    "traffic_volume": int(road["trips_volume"]),
                    "direction": int(road["match_dir"])
                })
        return nearby_roads

    def _get_traffic_data(self, location, radius=150):
        """Extract traffic flow data for animation"""
        traffic_data = []
        nearby_segments = self._get_nearby_roads(location, radius)
        
        for segment in nearby_segments:
            # Create traffic flow points along the segment
            coords = segment["coords"]
            volume = segment["traffic_volume"]
            
            # Generate vehicle positions based on volume
            num_vehicles = min(int(volume / 100), 10)  # Limit number of vehicles for visualization
            for i in range(num_vehicles):
                traffic_data.append({
                    "path": coords,
                    "speed": 30,  # km/h, can be adjusted based on road type
                    "direction": segment["direction"],
                    "type": "car"  # Can be extended to include different vehicle types
                })
        return traffic_data

def compute_storefront_impressions(storefront_location):
    """Compute impressions for a single storefront location"""
    analyzer = StorefrontAnalyzer()
    
    # Convert to GeoDataFrame for spatial operations
    storefront_gdf = gpd.GeoDataFrame(geometry=[storefront_location], crs="EPSG:4326")
    storefront_gdf = storefront_gdf.to_crs(epsg=3857)
    traffic_gdf_projected = traffic_gdf.to_crs(epsg=3857)
    
    # Enhanced segment selection
    visibility_radius = 150  # meters
    nearby_segments = traffic_gdf_projected[
        traffic_gdf_projected.geometry.distance(storefront_gdf.geometry.iloc[0]) <= visibility_radius
    ]
    
    if nearby_segments.empty:
        return 0
    
    total_impressions = 0
    segment_weights = []
    
    # Calculate impressions from nearby segments
    for _, segment in nearby_segments.iterrows():
        visibility_factor = compute_visibility_factor(segment, storefront_gdf)
        
        # Enhanced confidence weighting
        confidence_factor = 1.0
        if "trips_sample_count" in segment:
            min_sample = 100
            optimal_sample = 1000
            sample_count = segment["trips_sample_count"]
            confidence_factor = min(1.0, max(0.6, 
                0.6 + 0.4 * (sample_count - min_sample) / (optimal_sample - min_sample)
            ))
        
        # Calculate segment impression
        segment_impression = segment["trips_volume"] * visibility_factor * confidence_factor
        total_impressions += segment_impression
        segment_weights.append(visibility_factor)
    
    # Apply diversity bonus if multiple segments contribute
    if len(segment_weights) > 1:
        diversity_bonus = 1.0 + (0.1 * np.log1p(len(segment_weights)))
        total_impressions *= diversity_bonus
    
    # Add building data
    lat, lon = storefront_location.y, storefront_location.x
    buildings_data = analyzer.fetch_building_data(lat, lon)
    
    nearby_buildings = []
    for building in buildings_data.get("results", []):
        building_location = building["geometry"]["location"]
        nearby_buildings.append({
            "location": {
                "lat": building_location["lat"],
                "lon": building_location["lng"]
            },
            "height": analyzer.get_building_height(building["place_id"]),
            "name": building.get("name", "Unknown Building"),
            "type": building.get("types", ["building"])[0]
        })
    
    # Save results for web visualization
    result_file = analyzer.save_analysis_results(
        storefront_location,  # Pass the Point object directly
        total_impressions,
        nearby_buildings
    )
    print(f"Analysis results saved to: {result_file}")
    
    return total_impressions

# Step 4: Compute and Print Impression Scores with Additional Refinements

def visualize_storefront_impressions():
    # Create an interactive map
    center_lat = gdf_storefronts.geometry.y.mean()
    center_lon = gdf_storefronts.geometry.x.mean()
    m = folium.Map(location=[center_lat, center_lon], zoom_start=13)
    
    # Create color map
    colormap = LinearColormap(
        colors=['yellow', 'orange', 'red'],
        vmin=gdf_storefronts["normalized_impression_score"].min(),
        vmax=gdf_storefronts["normalized_impression_score"].max()
    )
    
    # Add storefronts to map
    for idx, row in gdf_storefronts.iterrows():
        folium.CircleMarker(
            location=[row.geometry.y, row.geometry.x],
            radius=10,
            popup=f"Score: {row['normalized_impression_score']:.2f}",
            color=colormap(row["normalized_impression_score"]),
            fill=True
        ).add_to(m)
    
    # Add roads
    for _, road in traffic_gdf.iterrows():
        if isinstance(road.geometry, LineString):
            coords = [(y, x) for x, y in road.geometry.coords]
            folium.PolyLine(
                coords,
                weight=2,
                color='gray',
                opacity=0.5
            ).add_to(m)
    
    # Save map
    m.save("storefront_impressions.html")
    print("Interactive map saved as 'storefront_impressions.html'")

def refine_impression_scores():
    if "impression_score" not in gdf_storefronts.columns:
        gdf_storefronts["impression_score"] = gdf_storefronts.geometry.apply(compute_storefront_impressions)
    
    # Remove outliers using IQR method
    Q1 = gdf_storefronts["impression_score"].quantile(0.25)
    Q3 = gdf_storefronts["impression_score"].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    # Clip extreme values
    gdf_storefronts["impression_score_cleaned"] = gdf_storefronts["impression_score"].clip(lower_bound, upper_bound)
    
    # Apply robust scaling (less sensitive to outliers)
    scaler = RobustScaler()
    normalized_scores = scaler.fit_transform(gdf_storefronts[["impression_score_cleaned"]])
    
    # Convert to 20-80 range
    gdf_storefronts["normalized_impression_score"] = 20 + 60 * (normalized_scores - normalized_scores.min()) / (normalized_scores.max() - normalized_scores.min())
    
    # Calculate and print detailed statistics
    print("\nStorefront Impressions Analysis:")
    print("-" * 50)
    print("Raw Impressions Statistics:")
    print(gdf_storefronts["impression_score"].describe())
    print("\nNormalized Scores (20-80 scale):")
    print(gdf_storefronts["normalized_impression_score"].describe())
    print("\nScore Distribution Analysis:")
    print("Skewness:", stats.skew(gdf_storefronts["normalized_impression_score"]))
    print("Kurtosis:", stats.kurtosis(gdf_storefronts["normalized_impression_score"]))

# Add this condition around the execution code
if __name__ == "__main__":
    # Initialize the data
    print("Computing impressions for all storefronts...")
    # Ensure each geometry is a Point before applying the function
    gdf_storefronts["impression_score"] = gdf_storefronts.geometry.apply(
        lambda geom: compute_storefront_impressions(geom) if isinstance(geom, Point) else 0
    )

    # Then normalize the scores
    refine_impression_scores()

    # Finally visualize
    visualize_storefront_impressions()

    # Update saved results with normalized scores
    update_results_with_normalized_scores()

# Now we can update the saved results with normalized scores if needed
def update_results_with_normalized_scores():
    results_path = "./API_scripts/Prediction/results/"
    for filename in os.listdir(results_path):
        if filename.startswith("analysis_") and filename.endswith(".json"):
            filepath = os.path.join(results_path, filename)
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            # Add normalized score
            location = Point(data["location"]["lon"], data["location"]["lat"])
            idx = gdf_storefronts.geometry.apply(lambda x: x.equals(location)).idxmax()
            data["normalized_score"] = float(gdf_storefronts.loc[idx, "normalized_impression_score"])
            
            with open(filepath, 'w') as f:
                json.dump(data, f, indent=2)

# Add address to coordinates conversion
def address_to_coordinates(address: str) -> tuple:
    """Convert address to coordinates using OpenStreetMap"""
    try:
        geolocator = Nominatim(user_agent="growthfactor_impressions")
        location = geolocator.geocode(address)
        if location:
            return (location.latitude, location.longitude)
        else:
            raise ValueError("Address not found")
    except GeocoderTimedOut:
        raise HTTPException(status_code=408, detail="Geocoding service timeout")

# Add data validation and caching
@lru_cache(maxsize=1000)
def get_cached_impression_score(lat: float, lon: float) -> float:
    """Cache impression scores for frequently requested locations"""
    point = Point(lon, lat)
    return compute_storefront_impressions(point)
