import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { configurations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// Get a specific configuration by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid configuration ID" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    
    // Find the configuration
    const [config] = await db
      .select()
      .from(configurations)
      .where(eq(configurations.id, id));

    if (!config) {
      return NextResponse.json(
        { error: "Configuration not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this configuration
    if (!config.isPublic) {
      if (!session || !session.user?.id) {
        return NextResponse.json(
          { error: "You must be logged in to access this configuration" },
          { status: 401 }
        );
      }

      const userId = parseInt(session.user.id);
      
      if (config.userId !== userId) {
        return NextResponse.json(
          { error: "You do not have access to this configuration" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching configuration:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the configuration" },
      { status: 500 }
    );
  }
}

// Update a configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid configuration ID" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to update configurations" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    
    // Check if configuration exists and belongs to the user
    const [existingConfig] = await db
      .select()
      .from(configurations)
      .where(and(
        eq(configurations.id, id),
        eq(configurations.userId, userId)
      ));

    if (!existingConfig) {
      return NextResponse.json(
        { error: "Configuration not found or you don't have permission to update it" },
        { status: 404 }
      );
    }

    // Get update data
    const body = await request.json();
    
    // Update the configuration
    const [updatedConfig] = await db
      .update(configurations)
      .set({
        name: body.name || existingConfig.name,
        description: body.description !== undefined ? body.description : existingConfig.description,
        totalSlots: body.totalSlots || existingConfig.totalSlots,
        pricePerSpin: body.pricePerSpin || existingConfig.pricePerSpin,
        defaultPrize: body.defaultPrize || existingConfig.defaultPrize,
        prizeConfigs: body.prizeConfigs || existingConfig.prizeConfigs,
        isPublic: body.isPublic !== undefined ? body.isPublic : existingConfig.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(configurations.id, id))
      .returning();

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error("Error updating configuration:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the configuration" },
      { status: 500 }
    );
  }
}

// Delete a configuration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid configuration ID" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to delete configurations" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    
    // Check if configuration exists and belongs to the user
    const [existingConfig] = await db
      .select({ id: configurations.id })
      .from(configurations)
      .where(and(
        eq(configurations.id, id),
        eq(configurations.userId, userId)
      ));

    if (!existingConfig) {
      return NextResponse.json(
        { error: "Configuration not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    // Delete the configuration
    await db
      .delete(configurations)
      .where(eq(configurations.id, id));

    return NextResponse.json(
      { message: "Configuration deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting configuration:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the configuration" },
      { status: 500 }
    );
  }
}