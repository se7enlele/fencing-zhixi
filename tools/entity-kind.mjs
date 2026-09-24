// Team entries describe a squad in one event, not a persistent individual.
export function isTeamEvent(event = {}) {
  return event.itemTypeCode === 'T' || event.itemType === 'T'
    || /团体|team/i.test([event.eventName, event.shortEventName, event.itemType].filter(Boolean).join(' '))
    || /[MW](?:F|E|S)T(?:U\d+|\d|$)/i.test(event.eventCode || '');
}
