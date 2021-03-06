import React, { useState, useEffect } from 'react';
import { Input, Button, Accordion, AccordionSection } from 'react-rainbow-components';
import formatMoney from 'accounting-js/lib/formatMoney';
import styled from 'styled-components';
import { Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useFirebaseApp } from 'reactfire';
import { StyleHeader } from '../historial/styled';
import Modal from 'react-modal';
import ExportRatesCSV from '../../dowloadData/ratesUser';

const StyledSubmit = styled.button.attrs(props => {
    return props.theme.rainbow.palette;
})`
    background-color: #ab0000;
    border: none;
    border-radius: 25px;
    padding: 0.5rem 2rem;
    color: white;

    &:hover {
        background-color: #c94141;
        color: white;
    }
`;

const StyledSection = styled(AccordionSection)`
    color: black;

    & section > div:first-child,
    .rainbow-flex.header-divider {
        border: 1px solid gainsboro;
        background: gainsboro;
    }

    & section > div:first-child h3,
    .rainbow-flex.header-divider h3 {
        font-size: 1rem;
        font-weight: bold;
        margin-bottom: 0;
    }

    & section > div:first-child + div {
        padding: 0;
    }

    & .rainbow-flex {
        border: 1px solid gainsboro;
        background: white;
    }

    & .rainbow-flex > div,
    .rainbow-flex.header-divider h3 {
        flex: 1 1;
        padding: 1rem 2rem;
    }
    & .rainbow-flex > div.actions {
        flex: 1 1;
        text-align: right;

        button {
            border: 0;
            background: none;
        }
    }
`;

const InlineInput = styled(Input)`
    display: inline-flex;
    width: 70px;
    position: relative;
    top: -25px;
`;

const ErrorText = styled.div`
    flex: 1 1 100% !important;
    font-size: 0.7rem;
    color: red;
    text-align: left !important;
    margin-top: -36px;
    margin-bottom: 1rem;
`;

function TarifarioPorServicio({ label, tarifas, kgExtra, entrega, user }) {
    const firebase = useFirebaseApp();
    const db = firebase.firestore();

    const [minRate, setMinRate] = useState();
    const [maxRate, setMaxRate] = useState();
    const [cost, setCost] = useState();
    const [modalIsOpen, setIsOpen] = useState(false);
    const [modalIsOpenExtra, setIsOpenExtra] = useState(false);
    const [minRateModal, setMinRateModal] = useState();
    const [maxRateModal, setMaxRateModal] = useState();
    const [costModal, setCostModal] = useState();
    const [extraCost, setExtraCost] = useState();
    const [keyRate, setKeyRate] = useState();
    const [addKgError, setAddKgError] = useState(false);
    const [addKgErrorModal, setAddKgErrorModal] = useState();
    const [maxValue, setMaxValue] = useState([]);

    const openModalExtra = () => {
        setIsOpenExtra(true);
    };

    const closeModalExtra = () => {
        setIsOpenExtra(false);
    };

    const openModal = (min, max, precio, key) => {
        setIsOpen(true);
        setKeyRate(key);
        setMinRateModal(min);
        setMaxRateModal(max);
        setCostModal(precio);
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    const deleteRate = key => {
        db.collection('profiles')
            .doc(user.id)
            .collection('rate')
            .doc(key)
            .delete()
            .then(function() {
                console.log('Document successfully deleted!');
            })
            .catch(function(error) {
                console.error('Error removing document: ', error);
            });
    };

    const tarifasMap = tarifas.map(tarifa => {
        // let key = label + idx;

        const { min, max, precio, key } = tarifa;
        return (
            <>
                <div className="rainbow-flex rainbow-flex_row rainbow-flex_wrap" key={key}>
                    {/* <div> De
                <input type="text" className="form-control" onChange={handleTarifaChange} name="tarifaMin" />
                </div> */}
                    <div>
                        De {tarifa.min} Hasta {tarifa.max} kg
                    </div>
                    <div>{formatMoney(tarifa.precio)}</div>
                    <div className="actions">
                        <button type="button">
                            <FontAwesomeIcon
                                icon={faPencilAlt}
                                onClick={() => openModal(min, max, precio, key)}
                            />
                        </button>
                        <button type="button">
                            <FontAwesomeIcon icon={faTrashAlt} onClick={() => deleteRate(key)} />
                        </button>
                    </div>
                </div>
                <Modal
                    isOpen={modalIsOpen}
                    contentLabel="Example Modal"
                    style={{
                        overlay: {
                            backgroundColor: 'rgba(100,100,100,0.5)',
                        },
                        content: {
                            width: 'fit-content',
                            height: 'fit-content',
                            margin: 'auto',
                            padding: '2rem',
                            borderRadius: '0.875rem',
                            color: 'crimson',
                            boxShadow: '0px 0px 16px -4px rgba(0, 0, 0, 0.75)',
                            fontFamily: "'Montserrat','sans-serif'",
                            textAlign: 'center',
                        },
                    }}
                >
                    <h2 style={{ fontSize: '1.5rem', textAlign: 'center' }}>Cambia la tarifa</h2>
                    <div className="rainbow-p-horizontal_medium rainbow-m-vertical_large">
                        De
                        <InlineInput
                            value={minRateModal}
                            type="text"
                            onChange={ev => setMinRateModal(ev.target.value)}
                        />
                        Hasta
                        <InlineInput
                            value={maxRateModal}
                            type="text"
                            onChange={ev => setMaxRateModal(ev.target.value)}
                        />
                        kg
                    </div>
                    <div className="rainbow-p-horizontal_medium rainbow-m-vertical_large">
                        Precio
                        <InlineInput
                            value={costModal}
                            type="text"
                            onChange={ev => setCostModal(ev.target.value)}
                        />
                    </div>
                    {addKgErrorModal && (
                        <ErrorText>Error: Es necesario ingresar datos validos</ErrorText>
                    )}
                    <button
                        type="button"
                        onClick={e => closeModal()}
                        style={{
                            border: 'none',
                            background: 'none',
                            float: 'right',
                            marginTop: '-14rem',
                            marginRight: '-1rem',
                        }}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <StyledSubmit
                        type="submit"
                        onClick={() => {
                            editRate();
                        }}
                    >
                        Continuar
                    </StyledSubmit>
                </Modal>
            </>
        );
    });

    const hasValidRateWeights = (currentRates, fromBase, toBase) => {
        const fromBaseVal = parseInt(fromBase, 10);
        const toBaseVal = parseInt(toBase, 10);

        if (fromBaseVal % 1 !== 0 || toBaseVal % 1 !== 0) {
            return false;
        }

        if (fromBaseVal >= toBaseVal) {
            return false;
        }

        const foundInvalidRates = currentRates.filter(currentRate => {
            const baseLowerWeight = parseInt(currentRate.min);
            const baseHigherWeight = parseInt(currentRate.max);

            if (fromBaseVal >= baseLowerWeight && fromBaseVal <= baseHigherWeight) {
                return true;
            }

            if (fromBaseVal <= baseLowerWeight && toBaseVal >= baseHigherWeight) {
                return true;
            }

            if (toBaseVal >= baseLowerWeight && toBaseVal <= baseHigherWeight) {
                return true;
            }

            return false;
        });

        return !foundInvalidRates.length;
    };

    const addRate = () => {
        if (hasValidRateWeights(tarifas, minRate, maxRate)) {
            setAddKgError(false);

            const addRateData = {
                min: parseInt(minRate),
                max: parseInt(maxRate),
                entrega,
                precio: parseInt(cost),
            };
            db.collection('profiles')
                .doc(user.id)
                .collection('rate')
                .add(addRateData)
                .then(function(docRef) {
                    console.log('Document written with ID (origen): ', docRef.id);
                })
                .catch(function(error) {
                    console.error('Error adding document: ', error);
                });
        } else {
            setAddKgError(true);
        }
    };

    const hasValidRateWeightsModal = (currentRates, fromBase, toBase) => {
        const fromBaseVal = parseInt(fromBase, 10);
        const toBaseVal = parseInt(toBase, 10);

        if (fromBaseVal % 1 !== 0 || toBaseVal % 1 !== 0) {
            return false;
        }

        if (fromBaseVal >= toBaseVal) {
            return false;
        }

        const foundInvalidRates = currentRates.filter(currentRate => {
            const baseLowerWeight = parseInt(currentRate.min);
            const baseHigherWeight = parseInt(currentRate.max);

            return false;
        });

        return !foundInvalidRates.length;
    };

    const editRate = () => {
        if (hasValidRateWeightsModal(tarifas, minRateModal, maxRateModal)) {
            setAddKgErrorModal(false);

            const editRate = {
                min: parseInt(minRateModal),
                max: parseInt(maxRateModal),
                precio: parseInt(costModal),
            };

            const editRateInformation = db
                .collection('profiles')
                .doc(user.id)
                .collection('rate')
                .doc(keyRate)
                .update(editRate);

            editRateInformation
                .then(function(docRef) {
                    console.log('Se cumplio! Document written with ID (guia): ', docRef.id);
                })
                .catch(function(error) {
                    console.error('Error adding document: ', error);
                });
            closeModal();
        } else {
            setAddKgErrorModal(true);
        }
    };

    const editKgExtra = () => {
        const editRateInformation = db
            .collection('profiles')
            .doc(user.id)
            .collection('rate')
            .doc(kgExtra[0].id)
            .update({ kgExtra: extraCost });

        editRateInformation
            .then(function(docRef) {
                console.log('Se cumplio! Document written with ID (guia): ', docRef.id);
            })
            .catch(function(error) {
                console.error('Error adding document: ', error);
            });
    };

    const addKgExtra = () => {
        if (kgExtra.length > 0 && kgExtra[0].id) {
            editKgExtra();
            return;
        }
        const addExtraRate = {
            max: 0,
            kgExtra: extraCost,
            entrega: `${entrega}Extra`,
        };

        const editRateInformation = db
            .collection('profiles')
            .doc(user.id)
            .collection('rate')
            .add(addExtraRate);

        editRateInformation
            .then(function(docRef) {
                console.log('Se cumplio! Document written with ID (guia): ', docRef.id);
            })
            .catch(function(error) {
                console.error('Error adding document: ', error);
            });
    };

    // El valor m??s alto del tarifario (por servicio)
    useEffect(() => {
        let tarifaMayor = 0;
        tarifas.forEach(tarifa => {
            tarifaMayor = tarifa.max > tarifaMayor ? tarifa.max : tarifaMayor;
        });
        !tarifaMayor ? setMaxValue(tarifaMayor) : setMaxValue(tarifaMayor + 1);
    }, [tarifas]);

    useEffect(() => {
        setMinRate(maxValue);
    }, [maxValue]);

    if (isNaN(maxValue)) {
        setMaxValue(0);
    }

    return (
        <StyledSection label={label}>
            {tarifasMap}
            <div className="rainbow-flex rainbow-flex_row rainbow-flex_wrap">
                <div>
                    De
                    <InlineInput
                        value={minRate}
                        // value={parseInt(maxValue)}
                        type="text"
                        onChange={ev => setMinRate(ev.target.value)}
                    />
                    Hasta
                    <InlineInput type="text" onChange={ev => setMaxRate(ev.target.value)} />
                    kg
                </div>
                <div>
                    $<InlineInput type="text" onChange={ev => setCost(ev.target.value)} />
                </div>
                <div className="actions">
                    <Button label="Confirmar" onClick={addRate} />
                </div>
                {addKgError && (
                    <ErrorText>
                        Error: Los kilogramos que tienes deben estar duplicados o no ser
                        consecutivos, favor de revisar
                    </ErrorText>
                )}
            </div>
            <div className="rainbow-flex rainbow-flex_row rainbow-flex_wrap header-divider">
                <h3>Kg Adicional</h3>
            </div>
            <div className="rainbow-flex rainbow-flex_row rainbow-flex_wrap">
                <div>{label}</div>
                {kgExtra.map((kgExtra, idx) => (
                    <div>{formatMoney(kgExtra.kgExtra)}</div>
                ))}

                <div className="actions">
                    <button type="button">
                        <FontAwesomeIcon icon={faPencilAlt} onClick={openModalExtra} />
                    </button>
                </div>
            </div>
            <Modal
                isOpen={modalIsOpenExtra}
                contentLabel="Example Modal"
                style={{
                    overlay: {
                        backgroundColor: 'rgba(100,100,100,0.5)',
                    },
                    content: {
                        width: 'fit-content',
                        height: 'fit-content',
                        margin: 'auto',
                        padding: '2rem',
                        borderRadius: '0.875rem',
                        color: 'crimson',
                        boxShadow: '0px 0px 16px -4px rgba(0, 0, 0, 0.75)',
                        fontFamily: "'Montserrat','sans-serif'",
                        textAlign: 'center',
                    },
                }}
            >
                <h2 style={{ fontSize: '1.5rem', textAlign: 'center' }}>Kilogramo Extra</h2>
                <div className="rainbow-p-horizontal_medium rainbow-m-vertical_large">
                    Precio
                    <InlineInput
                        value={extraCost}
                        type="text"
                        onChange={ev => setExtraCost(ev.target.value)}
                    />
                </div>
                <button
                    onClick={closeModalExtra}
                    type="button"
                    style={{
                        border: 'none',
                        background: 'none',
                        float: 'right',
                        marginTop: '-9.5rem',
                        marginRight: '-1.6rem',
                    }}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <StyledSubmit
                    type="submit"
                    onClick={() => {
                        addKgExtra();
                        closeModalExtra();
                    }}
                >
                    Continuar
                </StyledSubmit>
            </Modal>
        </StyledSection>
    );
}

export default function Tarifario({ user }) {
    const firebase = useFirebaseApp();
    const db = firebase.firestore();

    const [tarifas, setTarifas] = useState([]);

    function handleTarifas(snapshot) {
        const tarifasMap = snapshot.docs.map(doc => {
            return {
                id: doc.id,
                ...doc.data(),
            };
        });
        //console.log('tarifasMap', tarifasMap);

        const sortArray = (a, b) => {
            if (a.entrega < b.entrega) {
                return -1;
            }
            if (a.entrega > b.entrega) {
                return 1;
            }
            return 0;
        };

        tarifasMap.sort(sortArray);
        //console.log('tarifasMap', tarifasMap);

        setTarifas(tarifasMap);
    }

    useEffect(() => {
        if (user) {
            const reloadTarifas = () => {
                db.collection('profiles')
                    .doc(user.id)
                    .collection('rate')
                    .onSnapshot(handleTarifas);
            };
            reloadTarifas();
        }
    }, []);

    const getTarifasDeServicio = nombre => {
        const tarifaNormal = tarifas
            .filter(entregaFilter => {
                return entregaFilter.entrega === nombre;
            })
            .map(entrega => {
                return {
                    key: entrega.id,
                    max: entrega.max,
                    precio: entrega.precio,
                    min: entrega.min,
                };
            })
            .sort(function(a, b) {
                return a.max - b.max;
            });
        const tarifaExtra = tarifas
            .filter(entregaFilterExtra => {
                return entregaFilterExtra.entrega === `${nombre}Extra`;
            })
            .map(kgExtra => {
                return {
                    id: kgExtra.id,
                    kgExtra: kgExtra.kgExtra,
                };
            });
        return [tarifaNormal, tarifaExtra];
    };

    const [redpackExpress, redpackExpressExtra] = getTarifasDeServicio('redpackExpress');

    const [redpackEcoExpress, redpackEcoExpressExtra] = getTarifasDeServicio('redpackEcoExpress');

    const [fedexDiaSiguiente, fedexDiaSiguienteExtra] = getTarifasDeServicio('fedexDiaSiguiente');

    const [fedexEconomico, fedexEconomicoExtra] = getTarifasDeServicio('fedexEconomico');

    const [autoencargos, autoencargosExtra] = getTarifasDeServicio('autoencargos');

    const [estafetaDiaSiguiente, estafetaDiaSiguienteExtra] = getTarifasDeServicio(
        'estafetaDiaSiguiente',
    );

    const [estafetaEconomico, estafetaEconomicoExtra] = getTarifasDeServicio('estafetaEconomico');

    return (
        <>
            <StyleHeader>
                <Row className="row-header">
                    <h2>Tarifario del cliente</h2>
                    <ExportRatesCSV data={tarifas} />
                </Row>
            </StyleHeader>
            {/* <h2>Tarifario del cliente</h2> */}
            <h3 style={{ marginTop: '1rem' }}>Estafeta</h3>
            <Accordion id="accordion-estafeta" multiple>
                <TarifarioPorServicio
                    label="Estafeta D??a Siguiente"
                    tarifas={estafetaDiaSiguiente}
                    kgExtra={estafetaDiaSiguienteExtra}
                    entrega="estafetaDiaSiguiente"
                    user={user}
                />

                <TarifarioPorServicio
                    label="Estafeta Terrestre"
                    tarifas={estafetaEconomico}
                    kgExtra={estafetaEconomicoExtra}
                    entrega="estafetaEconomico"
                    user={user}
                />
            </Accordion>
            <h3 style={{ marginTop: '1rem' }}>Redpack</h3>
            <Accordion id="accordion-estafeta" multiple>
                <TarifarioPorServicio
                    label="Redpack Express"
                    tarifas={redpackExpress}
                    kgExtra={redpackExpressExtra}
                    entrega="redpackExpress"
                    user={user}
                />

                <TarifarioPorServicio
                    label="Redpack EcoExpress"
                    tarifas={redpackEcoExpress}
                    kgExtra={redpackEcoExpressExtra}
                    entrega="redpackEcoExpress"
                    user={user}
                />
            </Accordion>
            <h3 style={{ marginTop: '1rem' }}>Fedex</h3>
            <Accordion id="accordion-fedex" multiple>
                <TarifarioPorServicio
                    label="Fedex D??a Siguiente"
                    tarifas={fedexDiaSiguiente}
                    kgExtra={fedexDiaSiguienteExtra}
                    entrega="fedexDiaSiguiente"
                    user={user}
                />
                <TarifarioPorServicio
                    label="Fedex Terrestre"
                    tarifas={fedexEconomico}
                    kgExtra={fedexEconomicoExtra}
                    entrega="fedexEconomico"
                    user={user}
                />
            </Accordion>
            <h3 style={{ marginTop: '1rem' }}>Autoencargos</h3>
            <Accordion id="accordion-autoencargos" multiple>
                <TarifarioPorServicio
                    label="Autoencargos"
                    tarifas={autoencargos}
                    kgExtra={autoencargosExtra}
                    entrega="autoencargos"
                    user={user}
                />
                {/* <TarifarioPorServicio
                    label="Autoencargos D??a Siguiente"
                    tarifas={autoencargosDiaSiguiente}
                    kgExtra={autoencargosDiaSiguienteExtra}
                    entrega="autoencargosDiaSiguiente"
                    user={user}
                /> */}
            </Accordion>
            <p style={{ margin: '1rem' }}>
                <b>NOTA:</b> El peso volum??trico equivale al (largo x ancho x alto) / 5000 y este
                n??mero siempre es un entero que se redondea hacia arriba, esa equivalencia se tomar??
                para los kg.
            </p>
        </>
    );
}
