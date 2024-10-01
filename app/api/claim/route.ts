import { ConditionType, ImageClaimType, ImageClaimRole, PrismaClient, ClaimStatus } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

// Map condition string to enum
function mapConditionToEnum(type: string): ConditionType {
  switch (type.toLowerCase()) {
    case "before":
      return ConditionType.Before;
    case "after":
      return ConditionType.After;
    default:
      return ConditionType.Before;
  }
}

function mapImageTypeToEnum(type: string): ImageClaimType {
    switch (type.toLowerCase()) {
      case "image":
        return ImageClaimType.Image;
      case "video":
        return ImageClaimType.Video;
      default:
        return ImageClaimType.Image;
    }
  }
  function mapImageRoleToEnum(type: string): ImageClaimRole {
    switch (type.toLowerCase()) {
      case "user":
        return ImageClaimRole.User;
      case "admin":
        return ImageClaimRole.Admin;
      default:
        return ImageClaimRole.User;
    }
  }
export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    // First, create the claim without the claimNo
    const claim = await prisma.claim.create({
      data: {
        productId: data.productId,
        userId: Number(data.userId),
        condition: mapConditionToEnum(data.condition),
        details: data.details,
        status: "InProgress",
        claimNo: "",
      },
    });

    // Generate the claimNo using "CA" + id
    const claimNo = `CA${claim.id}`;

    // Update the claim with the generated claimNo
    const updatedClaim = await prisma.claim.update({
      where: { id: claim.id },
      data: { claimNo: claimNo },
    });
    // Transform and create the image claims
    const imageClaims = data.images.map(
      (item: { url: string; type: string; role: string }) => ({
        claimId: claim.id, 
        url: item.url,
        type: mapImageTypeToEnum(item.type), 
        role: mapImageRoleToEnum(item.role), 
      })
    );
    await prisma.imageClaim.createMany({
      data: imageClaims,
    });
    return NextResponse.json([]);
  } catch (error: any) {
    console.error("Error creating claim:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "";
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "15");
  const status = searchParams.get("status") || ""; // Get isComplete parameter from query string

    // Function to map string to MediaType enum
    function mapTypeToEnum(type: string): ClaimStatus | "" {
      switch (type.toLowerCase()) {
        case "inProgress":
          return ClaimStatus.InProgress;
        case "complete":
          return ClaimStatus.Complete;
        case "incomplete":
          return ClaimStatus.Incomplete;
        default:
          return ClaimStatus.InProgress;// If no matching type, return undefined to exclude from filter
      }
    }
  
    const claimStatus = mapTypeToEnum(status); // Convert string to enum value

  try {
    const whereConditions: any = {};
    const whereCount: any = {};

    if (userId) {
      whereConditions.userId = Number(userId);
      whereCount.userId = Number(userId);
    }

    if (claimStatus !== null || claimStatus !== "") {
      whereConditions.status = claimStatus;
    }

    if (q) {
      whereConditions.OR = [
        {
          claimNo: {
            contains: q,
            mode: 'insensitive', // Case-insensitive search
          },
        },
      ];

      whereCount.OR = [
        {
          claimNo: {
            contains: q,
            mode: 'insensitive', // Case-insensitive search
          },
        },
      ];
    }

    const [claims, total, claimCount] = await Promise.all([
      prisma.claim.findMany({
        where: whereConditions,
        include: { product: true, user: true, images: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.claim.count({
        where: whereConditions,
      }),
      prisma.claim.findMany({
        where: whereCount,
      }),
    ]);

    return NextResponse.json({ claims, total, claimCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}