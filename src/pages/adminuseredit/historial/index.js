import React, { useState, useEffect } from 'react';
import { Column, Badge, TableWithBrowserPagination } from 'react-rainbow-components';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { useFirebaseApp } from 'reactfire';
import { StyledPanel } from './styled';

const StyledBadge = styled(Badge)`
    color: #09d3ac;
`;
const StyledTable = styled(TableWithBrowserPagination)`
    td[data-label='Guía'] {
        > div {
            line-height: 1.2rem;
            > span {
                white-space: break-spaces;
                font-size: 12px;
            }
        }
    }
`;

const StatusBadge = ({ value }) => <StyledBadge label={value} variant="lightest" />;

const DownloadLabel = ({ value }) => {
    const [label, setLabel] = useState(true);
    useEffect(() => {
        //console.log('value', value);
        if (value === 'no disponible') {
            setLabel(false);
        } else {
            setLabel(true);
        }
    }, []);
    return (
        <>
            {label ? (
                <a
                    download="guia"
                    href={`data:application/pdf;base64,${value}`}
                    title="Descargar etiqueta"
                    variant="neutral"
                    className="rainbow-m-around_medium"
                >
                    <FontAwesomeIcon icon={faDownload} className="rainbow-medium" />
                </a>
            ) : (
                <p className="rainbow-m-around_medium">N/D</p>
            )}
        </>
    );
};

export default function HistoryUser({ user }) {
    const firebase = useFirebaseApp();
    const db = firebase.firestore();
    const [history, setHistory] = useState([]);
    const [tableData, setTableData] = useState();

    useEffect(() => {
        if (user) {
            let dataGuias = [];
            db.collection('guia')
                .where('ID', '==', user.ID)
                .where('status', '==', 'completed')
                .orderBy('creation_date', 'desc')
                .get()
                .then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                        console.log('data guias', doc.data(), 'doc.id', doc.id);
                        dataGuias.push(doc.data());
                    });
                    setHistory(dataGuias);
                    console.log('data', dataGuias);
                })
                .catch(function(error) {
                    console.log('Error getting documents: ', error);
                });
        }
    }, []);

    useEffect(() => {
        setTableData(
            history.map(historyRecord => {
                console.log('datos dentro del map', historyRecord.guide);
                return {
                    id: historyRecord.id,
                    date: new Date(historyRecord.sentDate).toLocaleDateString(),
                    status: historyRecord.status,
                    guide: historyRecord.rastreo,
                    origin: historyRecord.sender_addresses.name,
                    Destination: historyRecord.receiver_addresses.name,
                    weight: historyRecord.package.weight,
                    service: historyRecord.supplierData.Supplier,
                    cost: historyRecord.supplierData.Supplier_cost,
                    label:
                        historyRecord.supplierData.Supplier === 'autoencargos'
                            ? 'no disponible'
                            : historyRecord.label,
                };
            }),
        );
    }, [history]);

    return (
        <>
            <h2>Historial de envíos</h2>
            <div className="rainbow-p-bottom_large">
                <StyledPanel>
                    <StyledTable
                        data={tableData}
                        pageSize={10}
                        keyField="id"
                        emptyTitle="Oh no!"
                        emptyDescription="No hay ningun registro actualmente..."
                        className="direction-table"
                    >
                        <Column header="Fecha " field="date" defaultWidth={105} />
                        <Column
                            header="Status"
                            field="status"
                            component={StatusBadge}
                            defaultWidth={140}
                        />
                        <Column header="Guía" field="guide" defaultWidth={85} />
                        <Column header="Origen" field="origin" />
                        <Column header="Destino" field="Destination" />
                        <Column header="Peso" field="weight" defaultWidth={65} />
                        <Column header="Servicio" field="service" defaultWidth={135} />

                        <Column header="Costo" field="cost" defaultWidth={75} />
                        <Column
                            header="Etiqueta"
                            component={DownloadLabel}
                            field="label"
                            style={{ width: '10px!important' }}
                            defaultWidth={100}
                        />
                    </StyledTable>
                </StyledPanel>
            </div>
        </>
    );
}