import {SmartDevice} from "../SmartDevice";
import {DomainEvent} from "../../Events";
import {EventSubscription} from "../../subscriptions";
import {Profile} from "../../profile";
import {TeapotEvent} from "./Event";


export enum TeapotState {
    OFFLINE = "OFFLINE",
    WAITING = "WAITING",
    WORKING = "WORKING",
    OUT_OF_WATER = "OUT_OF_WATER"
}

export enum TeapotEventType {
    STARTED = "TEAPOT_STARTED",
    FINISHED = "TEAPOT_FINISHED",
    EMPTIED = "TEAPOT_EMPTIED"
}


export class Teapot extends SmartDevice {

    public readonly BOILING_TEMPERATURE = 100;
    public readonly MIN_WATER_THRESHOLD = 0.1; // liter

    private subscriptions: Array<EventSubscription<any>>;
    public state: TeapotState;

    public constructor(id: string, name: string, profile: Profile,
                       public temperature: number, public capacity: number,
                       public waterSupply: number, state?: TeapotState,
                       subscriptions?: Array<EventSubscription<any>>) {
        super(id, name, profile);
        this.subscriptions = subscriptions ?? [];
        this.state = state ?? TeapotState.WAITING;
    }

    protected dispatchEvent<E extends DomainEvent<Teapot>>(event: E): void {
        this.subscriptions.forEach((sub) => {
            if (sub.eventType === event.type) {
                const casted: EventSubscription<E> = sub as EventSubscription<E>;
                casted.reactOnEvent(event);
            }
        })
    }

    public subscribe<E extends EventSubscription<DomainEvent<Teapot>>>(subscription: E): void {
        this.subscriptions.push(subscription);
    }

    public equals(other: Teapot): boolean {
        return this.id === other.id;
    }

    public start(): void {
        if (this.state === TeapotState.OUT_OF_WATER || this.state === TeapotState.OFFLINE) {
            return; // todo throw domain exception
        }
        if (this.state === TeapotState.WORKING) {
            return; // already in work
        }

        this.state = TeapotState.WORKING;
        this.dispatchEvent(new TeapotEvent(this, new Date(), TeapotEventType.STARTED));
    }

    public finish(): void {
        if (this.state !== TeapotState.WORKING) {
            return; // todo throw domain exception
        }
        this.state = TeapotState.WAITING;
        this.dispatchEvent(new TeapotEvent(this, new Date(), TeapotEventType.FINISHED));
    }

    public updateState(temp: number, waterSupply: number): void {
        if (temp < 0 ) { // invalid temperature
            return; // todo throw domain exception
        }

        if (waterSupply < 0 || waterSupply > this.capacity) { // invalid water supply
            return; // todo throw domain exception
        }

        this.temperature = temp;
        this.waterSupply = waterSupply;


        if (this.temperature >= this.BOILING_TEMPERATURE) {
            this.finish();
        }

        if (this.waterSupply <= this.MIN_WATER_THRESHOLD) {
            this.dispatchEvent(new TeapotEvent(this, new Date(), TeapotEventType.EMPTIED));
        }
    }
}