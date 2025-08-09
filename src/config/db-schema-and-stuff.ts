import mongoose, { Schema, Document } from 'mongoose';

interface ITask  {
    id: string;
    boardId: string;
    title: string;
    description?: string;
    createdAt: string;
    dueDate: string | null;
    status: 'pending' | 'completed';
    priority: boolean
};

interface IBoard {
    title: string;
    id: string;
    tasks: ITask[];
};

export interface IUserData extends Document {
  userId: string; // The ID from your auth provider
  boards: IBoard[];
  updatedAt: Date;
}

const UserDataSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    boards: { type: Array, required: true },
  },
  { timestamps: true } // automatically adds `createdAt` and `updatedAt`
);

export default mongoose.models.UserData || mongoose.model<IUserData>('UserData', UserDataSchema);