interface Section {
    title: string;
    description: any[]; // sometimes string, sometimes string[], sometimes Media
    section: Section[];
}

interface Media {
    type: string;
    src: string;
}