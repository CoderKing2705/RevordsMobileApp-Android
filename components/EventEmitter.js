import EventEmitter from 'eventemitter3';

const eventEmitter = new EventEmitter();

export const EventBus = eventEmitter;