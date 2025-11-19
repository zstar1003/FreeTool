declare global {
    interface DataGridXLInstance {
        events: {
            on: (eventName: string, handler: (event: any) => void) => void;
            off?: (eventName: string, handler: (event: any) => void) => void;
        };
        destroy?: () => void;
        getData?: () => any[][];
        setData?: (data: any[][]) => void;
    }

    interface DataGridXLOptions {
        data?: any[][];
        [key: string]: any;
    }

    interface Window {
        DataGridXL?: new (container: HTMLElement | string, options?: DataGridXLOptions) => DataGridXLInstance;
    }
}

export {};

