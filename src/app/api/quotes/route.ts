import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/quotes - Get a random quote
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    // Build where clause
    const whereClause: { isActive: boolean; category?: string } = {
      isActive: true,
    };

    if (category) {
      whereClause.category = category;
    }

    // Get total count for random selection
    const count = await db.quote.count({ where: whereClause });

    if (count === 0) {
      // Return a default quote if none exist
      return NextResponse.json({
        quote: {
          id: "default",
          text: "The secret of getting ahead is getting started.",
          author: "Mark Twain",
          category: "motivation",
        },
      });
    }

    // Get random quote using skip
    const randomSkip = Math.floor(Math.random() * count);
    const quote = await db.quote.findFirst({
      where: whereClause,
      skip: randomSkip,
      select: {
        id: true,
        text: true,
        author: true,
        category: true,
      },
    });

    return NextResponse.json({ quote });
  } catch (error) {
    console.error("Error fetching quote:", error);
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 },
    );
  }
}

// POST /api/quotes - Add a new quote (admin only in future)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, author, category = "motivation" } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Quote text is required" },
        { status: 400 },
      );
    }

    const quote = await db.quote.create({
      data: {
        text,
        author: author || null,
        category,
        isActive: true,
      },
    });

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    console.error("Error creating quote:", error);
    return NextResponse.json(
      { error: "Failed to create quote" },
      { status: 500 },
    );
  }
}
