import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";

function createSubscribable() {
  const subs = new Set<(v: string) => void>();

  return {
    subscribe(cb: (v: string) => void) {
      subs.add(cb);

      return () => {
        subs.delete(cb);
      };
    },
    publish(v: string) {
      subs.forEach((cb) => cb(v));
    },
  };
}

declare function createEE<T extends Record<string, unknown>>(): {
  emit<TEventName extends keyof T>(
    eventName: TEventName,
    ...paylaod: Payload<T[TEventName]>
  ): void;
  on<TEventName extends keyof T>(
    eventName: TEventName,
    cb: (...payload: Payload<T[TEventName]>) => void
  ): void;
};

declare const Empty: unique symbol;
type IEmpty = typeof Empty;
type Payload<T> = T extends typeof Empty ? [] : [payload: T];

const a = createEE<{ banana: string; msg: IEmpty }>();

a.emit("banana", "clicked");
a.emit("msg");
a.on("banana", () => {});

function create() {
  const subscribers = new Map<string, Set<(msg: string) => void>>();

  return {
    on(eventName: string, cb: (msg: string) => void) {
      if (subscribers.has(eventName)) {
        subscribers.get(eventName)?.add(cb);
      } else {
        subscribers.set(eventName, new Set([cb]));
      }
      return () => {
        const currentEventName = subscribers.get(eventName)!;

        if (currentEventName.size > 1) {
          currentEventName.delete(cb);
        } else {
          subscribers.delete(eventName);
        }
      };
    },
    emit(eventName: string, msg: string) {
      const currentEvent = subscribers.get(eventName);

      if (currentEvent) {
        currentEvent.forEach((cb) => cb(msg));
      }
    },
  };
}

const ee = create();
const mitt = createSubscribable();

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    return ee.on("click", (msg) => {
      console.log("msg: HERE", msg);
    });
  }, []);

  return (
    <div>
      <h1>{count}</h1>
      <Button />
    </div>
  );
}

function Button() {
  return (
    <button
      onClick={() => {
        ee.emit("click", "clicked");
      }}
    >
      CLICK
    </button>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <Counter />
    </div>
  );
}

export default App;
