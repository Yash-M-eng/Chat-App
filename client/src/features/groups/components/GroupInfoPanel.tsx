import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserMinus, UserPlus, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setGroupInfoOpen } from '@/app/uiSlice';
import { addMember, removeMember } from '@/features/conversations/conversationsSlice';
import { Avatar } from '@/shared/components/Avatar';
import { CURRENT_USER_ID } from '@/shared/utils/constants';
import type { Conversation, User } from '@/types/chat';

interface GroupInfoPanelProps {
  conversation: Conversation;
}

interface AddMemberForm {
  userId: string;
}

export function GroupInfoPanel({ conversation }: GroupInfoPanelProps) {
  const dispatch = useAppDispatch();
  const usersById = useAppSelector((state) => state.users.byId);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberForm>({ defaultValues: { userId: '' } });

  const members = conversation.memberIds.map((id) => usersById[id]).filter((user): user is User => !!user);
  const usersToAdd = Object.values(usersById).filter((user) => !conversation.memberIds.includes(user.id));
  const onlineCount = members.filter((member) => member.status === 'online').length;

  async function onAddMember(values: AddMemberForm) {
    setError(null);
    const result = await dispatch(addMember({ conversationId: conversation.id, userId: values.userId }));
    if (addMember.rejected.match(result)) {
      setError(result.error.message ?? 'Could not add member');
    } else {
      reset();
    }
  }

  async function handleRemove(user: User) {
    if (!window.confirm(`Remove ${user.name} from the group?`)) return;
    setError(null);
    const result = await dispatch(removeMember({ conversationId: conversation.id, userId: user.id }));
    if (removeMember.rejected.match(result)) {
      setError(result.error.message ?? 'Could not remove member');
    }
  }

  return (
    <aside className="fixed inset-0 z-30 flex flex-col bg-panel lg:static lg:z-auto lg:w-80 lg:border-l lg:border-line">
      <header className="flex items-center gap-3 bg-deep px-4 py-3 text-cream">
        <button
          onClick={() => dispatch(setGroupInfoOpen(false))}
          aria-label="Close group info"
          className="rounded-full p-1 hover:bg-white/10"
        >
          <X size={20} />
        </button>
        <h2 className="font-semibold">Group info</h2>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-2 border-b border-line p-6 text-center">
          <Avatar src={conversation.avatar} name={conversation.name ?? 'Group'} size="lg" />
          <h3 className="text-lg font-semibold">{conversation.name}</h3>
          {conversation.description && <p className="text-sm text-muted">{conversation.description}</p>}
          <p className="text-xs text-muted">
            {members.length} members, {onlineCount} online
          </p>
        </div>

        <form onSubmit={handleSubmit(onAddMember)} className="border-b border-line p-4">
          <label htmlFor="add-member" className="mb-2 block text-sm font-medium">
            Add member
          </label>
          <div className="flex gap-2">
            <select
              id="add-member"
              {...register('userId', { required: 'Please select a user' })}
              disabled={usersToAdd.length === 0}
              className="min-w-0 flex-1 rounded-lg border border-line bg-field px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">{usersToAdd.length > 0 ? 'Select a user' : 'Everyone is already here'}</option>
              {usersToAdd.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={isSubmitting || usersToAdd.length === 0}
              className="flex items-center gap-1 rounded-lg bg-brand px-3 text-sm font-medium text-white hover:bg-accent disabled:opacity-50"
            >
              <UserPlus size={16} />
              Add
            </button>
          </div>
          {errors.userId && <p className="mt-1 text-xs text-brand">{errors.userId.message}</p>}
          {error && <p className="mt-1 text-xs text-brand">{error}</p>}
        </form>

        <p className="px-4 pt-4 text-sm font-medium">Members</p>
        <ul className="py-2">
          {members.map((member) => {
            const isMe = member.id === CURRENT_USER_ID;
            const isAdmin = conversation.adminIds.includes(member.id);

            return (
              <li key={member.id} className="flex items-center gap-3 px-4 py-2">
                <Avatar src={member.avatar} name={member.name} status={member.status} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{isMe ? 'You' : member.name}</p>
                  <p className="text-xs capitalize text-muted">{member.status}</p>
                </div>
                {isAdmin && <span className="rounded-full bg-forest px-2 py-0.5 text-[10px] text-cream">Admin</span>}
                {!isMe && (
                  <button
                    onClick={() => handleRemove(member)}
                    aria-label={`Remove ${member.name}`}
                    className="rounded-full p-1.5 text-muted hover:bg-hover hover:text-brand"
                  >
                    <UserMinus size={16} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
