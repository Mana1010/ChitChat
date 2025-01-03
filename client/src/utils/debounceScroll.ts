function debounceScroll(
  SESSION_NAME:
    | "privatelist_scroll_position"
    | "groupchatlist_scroll_position"
    | "mail_scroll_position"
) {
  let timeout: any;

  return (scrollPosition: number, delay: number = 200) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      sessionStorage.setItem(SESSION_NAME, JSON.stringify(scrollPosition));
    }, delay);
  };
}

export default debounceScroll;
