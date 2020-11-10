type Consumer<M> = (msg: M) => Promise<void>;
type Validator<M> = (msg: M) => boolean;

export default class EventLoop<K extends string, M> {
  private counter = 0;
  private consumers: Record<number, Consumer<M> | undefined> = {};
  private topicsConsumers: Record<string, number[]> = {};
  private messageValidator: Validator<M> = () => true;

  constructor(validator: Validator<M>) {
    this.messageValidator = validator;
  }

  async removeConsumer(consumer: number) {
    this.consumers[consumer] = undefined;
  }

  async subscribe(consumer: Consumer<M>, topics: K[]): Promise<number> {
    const id = ++this.counter;
    this.consumers[id] = consumer;
    for (const i in topics) {
      const topic = topics[i];
      if (this.topicsConsumers[topic]) {
        this.topicsConsumers[topic].push(id);
      } else {
        this.topicsConsumers[topic] = [id];
      }
    }
    return id;
  }

  async subscribe_once(consumer: Consumer<M>, topics: K[]): Promise<number> {
    const that = this;
    let sub_id: number | null = null;
    const callback: () => void = () => {
      if (sub_id != null) {
        that.removeConsumer(sub_id);
      }
    };
    const wrappedConsumer: Consumer<M> = (msg: M) => {
      callback();
      return consumer(msg);
    };
    sub_id = await that.subscribe(wrappedConsumer, topics);
    return sub_id;
  }

  async publish(topic: K, message: M): Promise<boolean> {
    const that = this;
    if (!this.messageValidator(message)) {
      throw {
        status: 401,
        message: "invalid message published",
      };
    }
    const consumers = this.topicsConsumers[topic];
    let actions: Promise<any>[] = [];
    if (consumers) {
      for (const i in consumers) {
        const consumer = consumers[i];
        const consumerFn = that.consumers[consumer];
        if (consumerFn) {
          actions.push(consumerFn(message));
        }
      }
    }
    await Promise.all(actions);
    return actions.length > 0;
  }
}
