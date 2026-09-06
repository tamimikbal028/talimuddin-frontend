import { FaComment, FaTimes, FaCheck, FaUserPlus } from "react-icons/fa";

type BtnProps = {
  onClick: () => void;
  disabled: boolean;
};

export const MessageButton = ({ onClick, disabled }: BtnProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex items-center rounded-lg bg-blue-100 px-4 py-2 text-blue-600 hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <FaComment className="mr-2" />
    Message
  </button>
);

export const UnfriendButton = ({ onClick, disabled }: BtnProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex items-center rounded-lg bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <FaTimes className="mr-1" />
    Unfriend
  </button>
);

export const AcceptButton = ({ onClick, disabled }: BtnProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex items-center rounded-lg bg-green-100 px-3 py-2 text-green-600 hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <FaCheck className="mr-1" />
    Accept
  </button>
);

export const RejectButton = ({ onClick, disabled }: BtnProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex items-center rounded-lg bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <FaTimes className="mr-1" />
    Reject
  </button>
);

export const AddFriendButton = ({ onClick, disabled }: BtnProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex items-center rounded-lg bg-blue-100 px-4 py-2 text-blue-600 hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <FaUserPlus className="mr-2" />
    Add Friend
  </button>
);

export const CancelButton = ({ onClick, disabled }: BtnProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex items-center rounded-lg bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <FaTimes className="mr-1" />
    Cancel Request
  </button>
);

export const UnblockButton = ({ onClick, disabled }: BtnProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex items-center rounded-lg bg-gray-100 px-3 py-2 text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
  >
    Unblock
  </button>
);

export default {
  MessageButton,
  UnfriendButton,
  AcceptButton,
  RejectButton,
  AddFriendButton,
  CancelButton,
  UnblockButton,
};

