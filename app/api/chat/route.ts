import { deepseek } from "@/lib/deepseek-instance";
import { systemPrompt } from "@/lib/system-prompt";
import { streamText, UIMessage, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
// import { deepseek } from "@/lib/deepseek-instance";
// import { systemPrompt } from "@/lib/system-prompt";
// import { currentUser } from "@clerk/nextjs/server";
// import { streamText } from "ai";
// import { NextResponse } from "next/server";
// import * as z from "zod";

// const messageSchema = z.object({
//   text: z.string().min(1, "text is required").max(1000, "Text is too long..."),
// });

// type messageSchema = z.infer<typeof messageSchema>;

// export async function POST(req: Request) {
//   const body = await req.json();
//   console.log("body", body);
//   // auth check
//   const user = await currentUser();
//   if (!user) {
//     return NextResponse.json({
//       success: false,
//       message: "Unauthorized",
//     });
//   }
//   // sanitize
//   const parsed = messageSchema.safeParse({ text: body.text });
//   if (!parsed.success) {
//     return NextResponse.json({
//       success: false,
//       message: "Invalid payload",
//       errors: z.flattenError(parsed.error).fieldErrors,
//     });
//   }

//   const { text } = parsed.data;

//   const result = streamText({
//     model: deepseek("deepseek-chat"),
//     system: systemPrompt,
//     messages: [
//       {
//         role: "user",
//         content: text,
//       },
//     ],
//   });

//   return result.toUIMessageStreamResponse();
// }
