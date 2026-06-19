import { Counter, Histogram, Gauge } from 'prom-client';

export const socketConnectionGauge = new Gauge({
    name: 'socket_chat_connections_total',
    help: 'Total number of active socket connections',
    labelNames: ['instance'],
});

export const socketChatCounter = new Counter({
    name: 'socket_chat_messages_total',
    help: 'Total number of chat messages sent',
    labelNames: ['conversation_id'],
});

export const socketChatHistogram = new Histogram({
    name: 'socket_chat_message_duration_seconds',
    help: 'Duration of chat message processing in seconds',
    labelNames: ['conversation_id'],
    buckets: [0.1, 0.5, 1, 2, 5],
});