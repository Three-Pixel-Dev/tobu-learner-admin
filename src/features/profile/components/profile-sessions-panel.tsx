import { getApiErrorMessage } from '@/app/api/http-client'
import { Button } from '@/components/ui/button'
import { Panel, PanelTitle } from '@/components/ui/panel'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useLogoutAllMutation,
  useRevokeSessionMutation,
  useSessionsQuery,
} from '@/shared/queries/auth.query'
import { formatRelativeTime } from '@/util/relative-time'

export function ProfileSessionsPanel() {
  const sessionsQuery = useSessionsQuery()
  const revokeSession = useRevokeSessionMutation()
  const logoutAll = useLogoutAllMutation()

  return (
    <div>
      <Panel className="p-[26px]">
        <PanelTitle>Active sessions</PanelTitle>
        <p className="mb-[20px] mt-[4px] text-[12.5px] text-muted-foreground">
          Where you're currently signed in.
        </p>

        {sessionsQuery.isLoading ? (
          <div className="flex flex-col gap-[12px]">
            <Skeleton className="h-[52px] w-full rounded-xl" />
            <Skeleton className="h-[52px] w-full rounded-xl" />
          </div>
        ) : null}

        {sessionsQuery.error ? (
          <p className="text-[12.5px] font-semibold text-destructive" role="alert">
            {getApiErrorMessage(sessionsQuery.error)}
          </p>
        ) : null}

        {sessionsQuery.data?.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No active sessions.</p>
        ) : null}

        <div className="divide-y divide-muted">
          {sessionsQuery.data?.map((session) => (
            <div
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-[16px] py-[12px] first:pt-0 last:pb-0"
            >
              <div>
                <div className="text-[14px] font-semibold">
                  {session.deviceLabel || 'Unknown device'}
                  {session.ipAddress ? ` — ${session.ipAddress}` : ''}
                </div>
                <div className="mt-[2px] text-[12.5px] text-muted-foreground">
                  {session.current
                    ? `Current session · started ${formatRelativeTime(session.createdAt)}`
                    : `Last active ${formatRelativeTime(session.lastActiveAt)}`}
                </div>
              </div>
              {session.current ? (
                <span className="inline-flex items-center rounded-[20px] bg-primary-soft px-[10px] py-[3px] text-[11.5px] font-bold text-primary-dark">
                  This device
                </span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={revokeSession.isPending}
                  onClick={() => revokeSession.mutate(session.id)}
                >
                  Sign out
                </Button>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="border-[1.5px] border-[#FECACA] bg-[#FFFBFB] p-[26px]">
        <PanelTitle className="text-destructive">Danger zone</PanelTitle>
        <div className="mt-[16px] flex flex-wrap items-center justify-between gap-[16px]">
          <div>
            <div className="text-[14px] font-semibold">Log out of all devices</div>
            <div className="mt-[2px] max-w-[440px] text-[12.5px] text-muted-foreground">
              Ends every active session, including this one.
            </div>
          </div>
          <Button
            type="button"
            variant="dangerOutline"
            disabled={logoutAll.isPending}
            onClick={() => logoutAll.mutate()}
          >
            {logoutAll.isPending ? 'Signing out…' : 'Log out everywhere'}
          </Button>
        </div>
        {logoutAll.error ? (
          <p className="mt-[12px] text-[12.5px] font-semibold text-destructive" role="alert">
            {getApiErrorMessage(logoutAll.error)}
          </p>
        ) : null}
      </Panel>
    </div>
  )
}
