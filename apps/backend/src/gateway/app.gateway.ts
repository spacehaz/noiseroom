import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatsRepository } from '../chats/chats.repository';
import { MessagesRepository } from '../messages/messages.repository';

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private jwt: JwtService,
    private chatsRepository: ChatsRepository,
    private messagesRepository: MessagesRepository,
  ) {}

  // Verify JWT from handshake, then auto-join all chat rooms the user is a member of.
  // Disconnect immediately if token is missing or invalid.
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token?.split(' ')[1];
      if (!token) throw new Error();

      const payload = this.jwt.verify(token);
      client.data.userId = payload.userId;
      client.data.username = payload.username;

      const chats = await this.chatsRepository.findMyChats(payload.userId);
      chats.forEach((chat: { id: string }) => client.join(chat.id));
    } catch {
      client.disconnect();
    }
  }

  // Clean up all room subscriptions when client disconnects.
  handleDisconnect(client: Socket) {
    client.rooms.forEach((room) => client.leave(room));
  }

  // Subscribe the client to a chat room so they receive new_message events.
  // Rejects if the user is not a member of the chat.
  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const member = await this.chatsRepository.isMember(data.chatId, client.data.userId);
    if (!member) throw new WsException('Not a member of this chat');

    client.join(data.chatId);
    return { event: 'joined', chatId: data.chatId };
  }

  // Save the ciphertext message to DB and broadcast it to all clients in the chat room.
  // Rejects if the sender is not a member of the chat.
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; ciphertext: string },
  ) {
    const member = await this.chatsRepository.isMember(data.chatId, client.data.userId);
    if (!member) throw new WsException('Not a member of this chat');

    const message = await this.messagesRepository.create(
      data.chatId,
      client.data.userId,
      data.ciphertext,
    );

    this.server.to(data.chatId).emit('new_message', message);
    return message;
  }
}
