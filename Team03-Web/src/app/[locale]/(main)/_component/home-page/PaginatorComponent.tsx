import { Paginator } from 'primereact/paginator';
import { PrimeReactProvider } from 'primereact/api';

type PaginatorComponentProps = {
    first: number;
    rows: number;
    totalRecords: number;
    onPageChange: (event: any) => void;
};

const PaginatorComponent = ({ first, rows, totalRecords, onPageChange }: PaginatorComponentProps) => {
    return (
        <PrimeReactProvider value={{ unstyled: false }}>
            <div className="flex justify-center mt-4">
                <Paginator
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    onPageChange={onPageChange}
                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    className="p-paginator"
                />
            </div>
        </PrimeReactProvider>
    );
};

export default PaginatorComponent;
