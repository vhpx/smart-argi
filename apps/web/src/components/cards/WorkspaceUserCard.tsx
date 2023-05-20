import { Divider } from '@mantine/core';
import Link from 'next/link';
import { WorkspaceUser } from '../../types/primitives/WorkspaceUser';
import { getGender } from '../../utils/gender-helper';
import { useWorkspaces } from '../../hooks/useWorkspaces';
import useTranslation from 'next-translate/useTranslation';

interface Props {
  user: WorkspaceUser;
  showGender?: boolean;
  showPhone?: boolean;
  showAddress?: boolean;
}

const WorkspaceUserCard = ({
  user,
  showGender = false,
  showPhone = false,
  showAddress = false,
}: Props) => {
  const { t } = useTranslation('ws-users-list-configs');

  const { ws } = useWorkspaces();
  if (!ws) return null;

  return (
    <Link
      href={`/${ws.id}/users/${user.id}`}
      className="group flex flex-col items-center justify-center rounded-lg border border-zinc-300 bg-zinc-500/5 text-center transition hover:bg-zinc-500/10 dark:border-zinc-700/80 dark:bg-zinc-800/70 dark:hover:bg-zinc-800"
    >
      <div className="flex h-full w-full flex-col">
        <div className="flex h-full flex-col items-center justify-center p-2 text-center">
          <div className="line-clamp-1 font-semibold tracking-wide">
            {user.name}{' '}
            {showGender && user.gender && (
              <span className="lowercase text-orange-600 dark:text-orange-300">
                ({getGender(user.gender)})
              </span>
            )}
          </div>
          {showPhone && (
            <div className="line-clamp-1 font-semibold text-zinc-500 dark:text-zinc-400/70">
              {user?.phone || t('no-phone')}
            </div>
          )}
        </div>
      </div>

      {showAddress && (
        <>
          <Divider
            variant="dashed"
            className="w-full border-zinc-300 dark:border-zinc-700"
          />
          <div className="m-2 h-full w-full px-2">
            <div className="flex h-full items-center justify-center rounded border border-purple-500/20 bg-purple-500/10 p-2 font-semibold text-purple-600 dark:border-purple-300/20 dark:bg-purple-300/10 dark:text-purple-300">
              {user?.address || t('no-address')}
            </div>
          </div>
        </>
      )}
    </Link>
  );
};

export default WorkspaceUserCard;
