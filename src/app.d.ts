declare namespace App {
        interface PageData {
                meta: {
                        title: string;
                        description: string;
                        imageUrl?: string;
                };
        }

        interface Error {
                message: string;
                code?: number | string;
        }
}
