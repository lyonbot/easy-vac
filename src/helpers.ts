export const loadText = (url: string) => fetch(url, { credentials: "omit" }).then(x => x.text());

export function debounce(func: () => void, wait?: number) {
  var timeout = null

  function timeoutFn() { timeout = null; func() }

  return function () {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(timeoutFn, wait || 100)
  };
};

const leadingComment = /^\s*(?:\/\/.+\s*|\/\*[\d\D]+?\*\/\s*)+/
export function removeLeadingJSComments(s: string) {
  return s.replace(leadingComment, "")
}
