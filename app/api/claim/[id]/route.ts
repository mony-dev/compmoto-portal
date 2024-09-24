import { NextResponse } from "next/server";
import { ClaimStatus, ImageClaimRole, ImageClaimType, OrderType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function mapImageTypeToEnum(type: string): ImageClaimType {
  switch (type.toLowerCase()) {
    case "image":
      return ImageClaimType.Image;
    case "video":
      return ImageClaimType.Video;
    case "file":
      return ImageClaimType.File;
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
  
const tableModelMap: Record<string, keyof PrismaClient> = {
    ProductGroup: "productGroup",
    Size: "size",
    Rim: "rim",
    Brand: "brand",
    GroupType: "groupType",
    ComRate: "comRate",
    Family: "family",
  };
  
export async function PUT(
  request: Request,
  { params, body }: { params: { id: number }; body: any }
) {
  const data = await request.json();
  const id = params.id;
  try {
    const updatedOrder = await prisma.claim.update({
      where: {
        id: Number(id),
      },
      data: {
        statusMessage: data.statusMessage,
        status: data.status
      },
    });
    const imageClaims = {
      claimId: Number(id), 
      url: data.images.url,
      type: mapImageTypeToEnum(data.images.type), 
      role: mapImageRoleToEnum(data.images.role), 
    }
    
    await prisma.imageClaim.createMany({
      data: imageClaims,
    });
    return NextResponse.json(updatedOrder);
  } catch (error) {
  console.log("error", error)

    return NextResponse.json(error);

  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  const { searchParams } = new URL(request.url);
  const id = params.id; 
  try {
    let claim:any = await prisma.claim.findUnique({
      where: {
        id: Number(id),
      },
      include: { 
        product: {
            include: {
                brand: true,
                minisize: true
            }
            
        }, 
        user: true, 
        images: true },
    });
    if (claim) {
        const minisize = claim.product?.minisize;
        if (!minisize) {
            return {
              ...claim.product,
              lv1Name: null,
              lv2Name: null,
              lv3Name: null,
            };
          }
          const lv1Array = minisize.lv1 ? JSON.parse(minisize.lv1 as string) : [];
          const lv2Array = minisize.lv2 ? JSON.parse(minisize.lv2 as string) : [];
          const lv3Array = minisize.lv3 ? JSON.parse(minisize.lv3 as string) : [];
          const lv1Data = lv1Array.length > 0 ? lv1Array[0] : null;
          const lv2Data = lv2Array.length > 0 ? lv2Array[0] : null;
          const lv3Data = lv3Array.length > 0 ? lv3Array[0] : null;
          const lv1Name = lv1Data?.data && claim.product.lv1Id ? await getCategoryName(lv1Data.data, claim.product.lv1Id) : null;
          const lv2Name = lv2Data?.data && claim.product.lv2Id ? await getCategoryName(lv2Data.data, claim.product.lv2Id) : null;
          const lv3Name = lv3Data?.data && claim.product.lv3Id ? await getCategoryName(lv3Data.data, claim.product.lv3Id) : null;
  
     
          claim = {
            ...claim,
            lv1Name: lv1Name?.name || null,
            lv2Name: lv2Name?.name || null,
            lv3Name: lv3Name?.name || null,
          }
    }
   
    return NextResponse.json(claim);
  } catch (error) {
    return NextResponse.json(error);
  } finally {
    await prisma.$disconnect();
  }
}

async function getCategoryName(tableName: string, id: number) {
    const model = tableModelMap[tableName];
    if (!model) return null;
    return (prisma as any)[model].findUnique({
      where: { id },
      select: { name: true },
    });
  }
  