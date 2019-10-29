export function hasPermission(permissionList: string[], permission: string): boolean {

  for (const permit of permissionList) {

    const regexText = '^' + permit.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';

    if (new RegExp(regexText).test(permission)) return true;

  }

  return false;

}
