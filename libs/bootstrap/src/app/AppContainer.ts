import { container } from 'tsyringe';

export class AppContainer {
    static reset(): void {
        container.reset()
    }

    static container(): typeof container {
        return container
    }
}