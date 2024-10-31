import { PRIVATE_SERVER_URL } from "@/utils/serverUrl";
import axios from "axios";
import authOptions from "@/utils/authOption";
import { getServerSession } from "next-auth";
type Params = { params: { conversationId: string } };

async function getUserConversation(conversationId: string) {
  try {
    const getParticipantName = await getServerSession(authOptions);
    const responseData = await axios.get(
      `${PRIVATE_SERVER_URL}/participant/name/${getParticipantName?.user.userId}/conversation/${conversationId}`
    );
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

function GetConversation() {
  return null;
}

export default GetConversation;
