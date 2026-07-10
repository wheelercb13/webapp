export function getParentPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";

  const [section, ...rest] = segments;

  switch (section) {
    case "domains": {
      if (rest.length === 0) return "/";
      if (rest.length === 1) return "/domains";
      const [id, ...tail] = rest;
      if (tail[0] === "edit") return `/domains/${id}`;
      if (tail[0] === "tasks") {
        if (tail.length === 2) return `/domains/${id}`;
        if (tail.length === 3 && tail[2] === "edit") return `/domains/${id}/tasks/${tail[1]}`;
      }
      return "/domains";
    }
    case "ideas": {
      if (rest.length === 0) return "/";
      if (rest.length === 1) return "/ideas";
      const [id, ...tail] = rest;
      if (tail[0] === "edit" || tail[0] === "send") return `/ideas/${id}`;
      return "/ideas";
    }
    case "inbox": {
      if (rest.length === 0) return "/";
      return "/inbox";
    }
    case "library": {
      if (rest.length === 0) return "/";
      return "/library";
    }
    case "routines": {
      if (rest.length === 0) return "/";
      if (rest[0] === "new" || rest[0] === "history") return "/routines";
      const [id, ...tail] = rest;
      if (tail.length === 0) return "/routines";
      if (tail[0] === "edit") return `/routines/${id}`;
      if (tail[0] === "steps") return `/routines/${id}`;
      return "/routines";
    }
    case "settings": {
      if (rest.length === 0) return "/";
      if (rest[0] === "users") {
        if (rest.length === 1) return "/settings";
        return "/settings/users";
      }
      return "/settings";
    }
    default:
      return "/";
  }
}
