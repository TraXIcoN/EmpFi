import { getSession } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session?.user) {
    return new NextResponse(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db("empifi");

    // Find or create user profile
    let userProfile = await db.collection("users").findOne({
      auth0Id: session.user.sub,
    });

    if (!userProfile) {
      userProfile = {
        auth0Id: session.user.sub,
        email: session.user.email,
        name: session.user.name,
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection("users").insertOne(userProfile);
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Database error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
