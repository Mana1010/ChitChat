const handleClipboard = async (text: string) => {
  try {
    const clipboardText = await navigator.clipboard.writeText(text);
    return { message: "Copied the text", type: "success" };
  } catch (err) {
    return { message: "Failed to copy the text", type: "error" };
  }
};

export default handleClipboard;
