import React, { useState, useEffect } from 'react';
import { Table, Column, Badge, TableWithBrowserPagination } from 'react-rainbow-components';
import { Row, Col } from 'react-bootstrap';
import styled from 'styled-components';
import formatMoney from 'accounting-js/lib/formatMoney';
import { StyledStatement, StatementContainer } from './style';
import { useFirebaseApp, useUser } from 'reactfire';
import ExportReactStatementCSV from '../dowloadData/statement';
const containerStyles = { height: 600 };
const containerTableStyles = { height: 256 };

// const StyledTable = styled(Table)`
//     color: #1de9b6;
// `;

const StyledColumn = styled(Column)`
    color: #1de9b6;
`;

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

const StatementPage = () => {
    const firebase = useFirebaseApp();
    const db = firebase.firestore();
    const user = useUser();

    const [statementData, setStatementData] = useState([]);

    const optionsDate = { year: '2-digit', month: '2-digit', day: '2-digit' };

    useEffect(() => {
        const data = [];

        //Getting all the shippings
        db.collection('guia')
            .where('ID', '==', user.uid)
            .where('status', '==', 'completed')
            //.orderBy('creation_date', 'desc')
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    //console.log('data guias', doc.data().creation_date, 'doc.id', doc.id);
                    data.push({
                        id: doc.id,
                        concept: 'GUIA',
                        reference: doc.data().rastreo ? doc.data().rastreo[0] : 'error',
                        monto: doc.data().rastreo
                            ? parseFloat(doc.data().supplierData.Supplier_cost)
                            : 0,
                        date: doc.data().creation_date.toDate(),
                        saldo: 0,
                    });
                });
                console.log('data', data);
                //setRecordsData(data);
            })
            .catch(function(error) {
                console.log('Error getting documents: ', error);
            });

        db.collection('voucher')
            .where('ID', '==', user.uid)
            //.orderBy('create_date', 'desc')
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    //console.log('all vouchers', doc.data(), 'doc.id', doc.id);
                    data.push({
                        id: doc.id,
                        concept: 'CDS',
                        reference: doc.data().referencia ? doc.data().referencia : 's/r',
                        monto: parseFloat(doc.data().saldo),
                        date: new Date(doc.data().create_date),
                        saldo: 0,
                    });
                });
                // console.log('data', data)

                // const sortedData = data.sort((a, b) => b.date - a.date );
                // console.log(sortedData);
            })
            .catch(function(error) {
                console.log('Error getting documents: ', error);
            });

        db.collection('restCredit')
            .where('ID', '==', user.uid)
            //.orderBy('create_date', 'desc')
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    //console.log('all vouchers', doc.data().create_date, 'doc.id', doc.id);
                    data.push({
                        id: doc.id,
                        concept: 'RC',
                        reference: doc.data().referencia ? doc.data().referencia : 's/r',
                        monto: parseFloat(doc.data().saldo),
                        date: new Date(doc.data().create_date),
                        saldo: 0,
                    });
                });
                // console.log('data', data)

                // const sortedData = data.sort((a, b) => b.date - a.date );
                // console.log(sortedData);
            })
            .catch(function(error) {
                console.log('Error getting documents: ', error);
            });

        db.collection('overweights')
            .where('ID', '==', user.uid)
            //.orderBy('fecha', 'desc')
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    //console.log('all vouchers', doc.data().create_date, 'doc.id', doc.id);
                    data.push({
                        id: doc.id,
                        concept: 'SOBREPESO',
                        reference: doc.data().rastreo,
                        monto: parseFloat(doc.data().cargo),
                        date: doc.data().fecha.toDate(),
                        saldo: 0,
                    });
                });
                //console.log('data', data);

                const sortedData = data.sort((a, b) => {
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                    // b.date - a.date
                });
                console.log(sortedData);
                makingOperations(sortedData);
            })
            .catch(function(error) {
                console.log('Error getting documents: ', error);
            });

        // const reloadRecords = () => {
        //     db.collection('overweights')
        //         .where('ID', '==', user.uid)
        //         .onSnapshot(handleOverWeight);
        // };
        // reloadRecords();
    }, []);

    const makingOperations = data => {
        let newStatement;

        let startStatement = data[0].monto;
        console.log(startStatement);

        data[0].saldo = startStatement;
        console.log(data[0]);

        data.map((da, index) => {
            console.log(da.id, index, 'saldo actual', da.saldo);
            if (index > 0) {
                console.log('saldo anterior', data[index - 1].saldo);
                let prevSaldo = data[index - 1].saldo;
                if (da.concept === 'GUIA' || da.concept === 'SOBREPESO' || da.concept === 'RC') {
                    newStatement = prevSaldo - da.monto;
                    data[index].saldo = newStatement;
                }
                if (da.concept === 'CDS') {
                    newStatement = prevSaldo + da.monto;
                    data[index].saldo = newStatement;
                }
            }
        });

        console.log(data);
        setStatementData(data);
    };

    // function handleOverWeight(snapshot) {
    //     let overWeightSorted = [];
    //     const overWeightData = snapshot.docs.map(doc => {
    //         // console.log(doc.data());
    //         return {
    //             id: doc.id,
    //             ...doc.data(),
    //         };
    //     });
    //     overWeightSorted = overWeightData.sort((a, b) => b.fecha - a.fecha);
    //     setOverWeightData(overWeightSorted);
    // }

    const data = statementData.map((statement, idx) => {
        return {
            id: statement.id,
            concept: statement.concept,
            date: statement.date.toLocaleDateString(),
            reference: statement.reference,
            monto: statement.monto.toFixed(2),
            saldo: statement.saldo.toFixed(2),
        };
    });

    return (
        <StyledStatement>
            <StatementContainer>
                <Row className="row-header">
                    <h1>Mis movimientos</h1>
                    <ExportReactStatementCSV data={statementData} />
                </Row>
                <div className="back">
                    <div className="rainbow-p-bottom_xx-large">
                        <div style={containerStyles}>
                            <StyledTable
                                // pageSize={10}
                                data={data}
                                keyField="id"
                                emptyTitle="Oh no!"
                                emptyDescription="No hay ningun registro actualmente..."
                            >
                                <StyledColumn
                                    header="Concepto"
                                    field="concept"
                                    defaultWidth={250}
                                />
                                <StyledColumn header="Fecha " field="date" defaultWidth={150} />
                                <StyledColumn header="Reference" field="reference" />
                                <StyledColumn header="Monto" field="monto" />
                                <StyledColumn header="Saldo" field="saldo" />
                            </StyledTable>
                        </div>
                    </div>
                </div>
            </StatementContainer>
        </StyledStatement>
    );
};

export default StatementPage;
