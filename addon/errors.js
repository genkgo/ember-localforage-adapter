import EmberError from '@ember/error';

export class NotFoundError extends EmberError {
  constructor(message) {
    super(message);

    this.name = 'NotFoundError';
  }
}
