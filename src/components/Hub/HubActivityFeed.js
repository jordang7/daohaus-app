import React, { useEffect, useState } from 'react';
import ActivityCard from '../Activities/ActivityCard';

const HubActivityFeed = ({ daos }) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    let proposalActivities = [];
    let unreadProposals = [];
    let rageActivities = [];

    daos.forEach((dao) => {
      const activeProps = dao.proposals.filter((prop) => {
        return prop.activityFeed.unread;
      });
      unreadProposals = [...unreadProposals, ...activeProps];

      proposalActivities = [
        ...proposalActivities,
        ...activeProps.map((proposal) => {
          return { ...proposal, daoTitle: dao.title };
        }),
      ];

      const activeRages = dao.rageQuits.filter((rage) => {
        // 1209600000 === 2 weeks
        const now = (new Date() / 1000) | 0;
        return +rage.createdAt >= now - 1209600;
      });

      rageActivities = [
        ...rageActivities,
        ...activeRages.map((rage) => {
          return { ...rage, daoTitle: dao.title };
        }),
      ];
    });

    setActivities(
      [...proposalActivities, ...rageActivities].sort(
        (a, b) => +b.createdAt - +a.createdAt,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {activities.map((activity) => (
        <ActivityCard activity={activity} key={activity.id} isLoaded={true} />
      ))}
    </>
  );
};

export default HubActivityFeed;
