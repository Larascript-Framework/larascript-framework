import { generateUuidV4 } from '@ben-shepherd/larascript-utils-bundle';
import { ISessionService, TSessionData, TSessionObject } from '@src/core/domains/session/interfaces/ISessionService';
import { app } from '@src/core/services/App';
import { AsyncLocalStorage } from 'async_hooks';

// Short hand for app('session')
export const session = () => app('session');

/**
 * SessionService manages session state across asynchronous operations using AsyncLocalStorage.
 * It provides a way to maintain session context throughout the request lifecycle,
 * allowing access to session data from any point in the async execution chain
 * without explicitly passing the session through each function.
 */
class SessionService implements ISessionService {

    private asyncLocalStorage = new AsyncLocalStorage<TSessionObject>();

    /**
     * Starts a new session with the given ID or creates a new one
     * @param sessionId Optional session ID to use
     * @returns Promise that resolves when session is started
     */
    async start(sessionId?: string): Promise<void> {
        const session = this.createSession();
        if (sessionId) {
            session.id = sessionId;
        }
        
        await this.asyncLocalStorage.run(session, async () => {
            // Initialize any session data here if needed
            return Promise.resolve();
        });

        // Store the session after initialization
        this.asyncLocalStorage.enterWith(session);
    }

    /**
     * Creates a new session with a unique ID and empty data store.
     * @param data Optional initial session data
     * @returns New session object
     */
    createSession<T extends TSessionData>(data?: T): TSessionObject<T> {
        return {
            id: generateUuidV4(),
            data: data || {} as T
        };
    }

    /**
     * Creates a new session and runs the callback within the session context.
     * @param callback Function to execute within the session context
     * @param data Optional initial session data
     * @returns Result of the callback execution
     */
    async runWithSession<T extends TSessionData, R>(
        callback: () => Promise<R> | R,
        data?: T
    ): Promise<R> {
        const session = this.createSession(data);
        return this.asyncLocalStorage.run(session, callback);
    }

    /**
     * Retrieves the current session from the async context.
     * @throws {Error} If no session exists in the current context
     * @returns The current session
     */
    getSession<T extends TSessionData>(): TSessionObject<T> {
        const session = this.asyncLocalStorage.getStore();
        if (!session) {
            throw new Error('No session found in current context');
        }
        return session as TSessionObject<T>;
    }

    /**
     * Gets the ID of the current session.
     * @throws {Error} If no session exists in the current context
     * @returns The current session ID
     */
    getSessionId(): string {
        return this.getSession().id;
    }

    /**
     * Gets the data store of the current session.
     * @throws {Error} If no session exists in the current context
     * @returns The session data store
     */
    getSessionData<T extends TSessionData>(): T {
        return this.getSession<T>().data;
    }

    /**
     * Sets the data store of the current session.
     * @param data The new session data
     */
    setSessionData<T extends TSessionData>(data: T): void {
        const session = this.getSession();
        const updatedSession = { ...session, data };
        Object.assign(session, updatedSession);
    }

    /**
     * Updates the data store of the current session with new data.
     * @param data The data to merge with existing session data
     */
    updateSessionData<T extends TSessionData>(data: T): void {
        const session = this.getSession();
        const updatedSession = { ...session, data: { ...session.data, ...data } };
        Object.assign(session, updatedSession);
    }

}

export default SessionService;
