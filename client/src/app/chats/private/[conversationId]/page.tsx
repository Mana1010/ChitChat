import { serverUrl } from "@/utils/serverUrl";
import axios from "axios";
import authOptions from "@/utils/authOption";
import { getServerSession } from "next-auth";
type Params = { params: { conversationId: string } };

async function getUserConversation(conversationId: string) {
  try {
    const getParticipantName = await getServerSession(authOptions);
    const responseData = await axios.get(
      `${serverUrl}/api/messages/conversation-name/${getParticipantName?.user.userId}/conversation/${conversationId}`
    );
    console.log(responseData.data);
    return responseData.data.name;
  } catch (err: unknown) {
    return err;
  }
}
export async function generateMetadata({ params }: Params) {
  const getChatName = await getUserConversation(params.conversationId);

  return {
    title: `${getChatName || "New Chat"} | Private ChitChat`,
  };
}

async function GetConversation() {
  return null;
}

export default GetConversation;
