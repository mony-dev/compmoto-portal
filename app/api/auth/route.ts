// import { proceedError, respondSuccess } from "@lib-admin/responses/api-response";

import { NextRequest } from "next/server";
import { RestError } from "@lib-shared/models/rest-error";
// import { logIn } from "@lib-admin/controllers/admin-controller";
// import { loginWithEmailPasswordBody } from "@lib-admin/schemas/user-schema";
// import { serializeBase } from "@lib-shared/serializers/data-serializer";

export async function POST(request: NextRequest) {
  // try {
  //   const body = await request.json();
  //   request.jsonBody = body;
  //   if (!body) {
  //     throw RestError.unauthorized;
  //   }
  //   const data = loginWithEmailPasswordBody.strip().parse(body);
  //   const authorization = await logIn(data);
  //   const json = serializeBase({ authorization });
  //   return respondSuccess(request, json);
  // } catch (err: unknown) {
  //   return proceedError(request, err);
  // }
}
