import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { configurations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// Get all configurations for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to access configurations" },
        { status: 401 }
      );
    }

    // Cast to any because NextAuth types don't include id by default
    const userId = parseInt((session.user as any).id);
    
    const userConfigs = await db
      .select()
      .from(configurations)
      .where(eq(configurations.userId, userId));

    return NextResponse.json(userConfigs);
  } catch (error) {
    console.error("Error fetching configurations:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching configurations" },
      { status: 500 }
    );
  }
}

// Create a new configuration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to create configurations" },
        { status: 401 }
      );
    }

    // Cast to any because NextAuth types don't include id by default
    const userId = parseInt((session.user as any).id);
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.totalSlots || !body.pricePerSpin || 
        !body.defaultPrize || !body.prizeConfigs) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the configuration
    const [newConfig] = await db
      .insert(configurations)
      .values({
        userId,
        name: body.name,
        description: body.description || "",
        totalSlots: body.totalSlots,
        pricePerSpin: body.pricePerSpin,
        defaultPrize: body.defaultPrize,
        prizeConfigs: body.prizeConfigs,
        isPublic: body.isPublic || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newConfig, { status: 201 });
  } catch (error) {
    console.error("Error creating configuration:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the configuration" },
      { status: 500 }
    );
  }
}