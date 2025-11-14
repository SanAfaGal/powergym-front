// External dependencies
import { memo } from 'react';
import { motion } from 'framer-motion';

// Feature components
import { ClientCard } from './ClientCard';
import { type Client } from '../..';

/**
 * Props for ClientCards component
 */
interface ClientCardsProps {
  /** Array of clients to display */
  clients: Client[];
  /** Optional callback when viewing client details */
  onView?: (clientId: string) => void;
  /** Callback when editing a client */
  onEdit: (client: Client) => void;
  /** Callback when deactivating a client */
  onDelete: (client: Client) => void;
  /** Optional callback when activating a client */
  onActivate?: (client: Client) => void;
  /** Whether a delete/activate operation is in progress */
  isDeleting?: boolean;
}

/**
 * ClientCards - Grid of client cards component
 * 
 * Renders a responsive grid of client cards.
 * Grid layout: 1 column on mobile, 2 on tablet, 3 on desktop.
 * 
 * @param props - ClientCards component props
 * @returns JSX element
 */
export const ClientCards = memo(({
  clients,
  onView,
  onEdit,
  onDelete,
  onActivate,
  isDeleting = false,
}: ClientCardsProps): JSX.Element => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
      {clients.map((client) => (
        <motion.div
          key={client.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ClientCard
            client={client}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onActivate={onActivate}
            isDeleting={isDeleting}
          />
        </motion.div>
      ))}
    </div>
  );
});

ClientCards.displayName = 'ClientCards';

