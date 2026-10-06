import { AuthUser, getAuthUser } from './auth';

export interface AuditLogOptions {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'STATUS_CHANGE' | string;
  entity: 'Page' | 'Program' | 'Faculty' | 'Media' | 'MediaFolder' | 'Enquiry' | 'User' | 'Role' | 'GlobalSettings' | 'SiteSettings' | string;
  entityId?: string | null;
  details?: Record<string, any> | string;
  user?: AuthUser | null;
}

export async function logAction(
  request: Request | null,
  options: AuditLogOptions
) {
  try {
    let userId: string | null = null;
    let userName = 'System';
    let userEmail = 'system@convocation.guni.ac.in';
    let clientIp = '127.0.0.1';
    let userAgent = 'Unknown';

    if (options.user) {
      userId = options.user.id;
      userName = options.user.name || options.user.username;
      userEmail = options.user.username;
      if (options.user.clientIp) clientIp = options.user.clientIp;
      if (options.user.userAgent) userAgent = options.user.userAgent;
    } else if (request) {
      const authResult = await getAuthUser(request);
      if (authResult.user) {
        userId = authResult.user.id;
        userName = authResult.user.name || authResult.user.username;
        userEmail = authResult.user.username;
        if (authResult.user.clientIp) clientIp = authResult.user.clientIp;
        if (authResult.user.userAgent) userAgent = authResult.user.userAgent;
      } else {
        clientIp =
          request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
          request.headers.get('x-real-ip') ||
          '127.0.0.1';
        userAgent = request.headers.get('user-agent') || 'Unknown';
      }
    }
  } catch (e) {
    // Non-blocking logger
  }
}
