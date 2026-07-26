import { ActivityItem } from '@/components/common/activity-item'
import { Panel, PanelHead, PanelTitle } from '@/components/ui/panel'
import { DASHBOARD_ACTIVITY } from '@/features/dashboard/dashboard.mock'

export function RecentActivity() {
  return (
    <Panel>
      <PanelHead>
        <PanelTitle>🕐 Recent activity</PanelTitle>
      </PanelHead>
      {DASHBOARD_ACTIVITY.map((item) => (
        <ActivityItem
          key={item.id}
          icon={item.icon}
          tone={item.tone}
          time={item.time}
          text={item.segments.map((segment, index) =>
            segment.bold ? <b key={index}>{segment.text}</b> : <span key={index}>{segment.text}</span>,
          )}
        />
      ))}
    </Panel>
  )
}
