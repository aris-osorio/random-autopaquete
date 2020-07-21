import React, { useState, useEffect } from 'react';
import { Input, CheckboxToggle, Button, Picklist, Option } from 'react-rainbow-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useFirebaseApp, useUser } from 'reactfire';
import { StyledLeftPane, StyledRightPane, StyledPaneContainer, StyledRadioGroup } from './styled';

const states = {
    AG: 'Aguascalientes',
    BC: 'Baja California',
    BS: 'Baja California Sur',
    CM: 'Campeche',
    CS: 'Chiapas',
    CH: 'Chihuahua',
    CO: 'Coahuila',
    CL: 'Colima',
    DF: 'Ciudad de México',
    DG: 'Durango',
    GT: 'Guanajuato',
    GR: 'Guerrero',
    HG: 'Hidalgo',
    JA: 'Jalisco',
    EM: 'Estado de México',
    MI: 'Michoacán',
    MO: 'Morelos',
    NA: 'Nayarit',
    NL: 'Nuevo León',
    OA: 'Oaxaca',
    PU: 'Puebla',
    QE: 'Queretaro',
    QR: 'Quintana Roo',
    SL: 'San Luis Potosi',
    SI: 'Sinaloa',
    SO: 'Sonora',
    TB: 'Tabasco',
    TM: 'Tamaulipas',
    TL: 'Tlaxcala',
    VE: 'Veracruz',
    YU: 'Yucatán',
    ZA: 'Zacatecas',
};

const StatePicklistOptions = () => {
    const allStates = Object.keys(states).map(code => {
        return <Option key={code} value={code} name={states[code]} label={states[code]} />;
    });

    return allStates;
};

const AddressRadioOption = ({ directions }) => {
    const {
        neighborhood,
        Referencias_lugar,
        Telefono,
        street_number,
        country,
        state,
        codigo_postal,
        name,
    } = directions;

    return (
        <>
            <span>
                <b>{name}</b>
            </span>
            <p>{street_number}</p>
            <p>{neighborhood}</p>
            <p>
                {country}, {state}
            </p>
            <p>C.P. {codigo_postal}</p>
            <p>Tel {Telefono}</p>
        </>
    );
};

export const OrigenComponent = ({ onSave }) => {
    const firebase = useFirebaseApp();
    const db = firebase.firestore();
    const user = useUser();

    const [error, setError] = useState(false);
    const [errorCredits, setErrorCredits] = useState(false);
    const [directionData, setDirectionData] = useState([]);

    const [value, setValue] = useState();

    const [filter, setFilter] = useState('');

    const [name, setName] = useState('');
    const [CP, setCP] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState({ label: '', value: '' });
    const [streetNumber, setStreetNumber] = useState('');
    const [placeRef, setPlaceRef] = useState('');
    const [phone, setPhone] = useState('');

    const [checkBox, setCheckBox] = useState(true);

    const [userName, setUserName] = useState('');
    const [status, setStatus] = useState();

    const creationDate = new Date();

    let idGuia;

    useEffect(() => {
        if (user) {
            const reloadDirectios = () => {
                db.collection('sender_addresses')
                    .where('ID', '==', user.uid)
                    .onSnapshot(handleDirections);
            };
            reloadDirectios();
        }
    }, []);

    function handleDirections(snapshot) {
        const directionData = snapshot.docs.map(doc => {
            return {
                id: doc.id,
                ...doc.data(),
            };
        });
        setDirectionData(directionData);
    }

    const options = directionData
        .filter(directions => {
            if (filter === null) {
                return directions;
            } else if (
                directions.name.includes(filter) ||
                directions.street_number.includes(filter)
            ) {
                return directions;
            }
        })
        .map(directions => {
            return {
                value: directions.id + '',
                label: <AddressRadioOption key={directions.id} directions={directions} />,
            };
        });

    //Se obtienen las direcciones guardadas
    useEffect(() => {
        if (value) {
            const docRef = db.collection('sender_addresses').doc(value);
            docRef
                .get()
                .then(function(doc) {
                    if (doc.exists) {
                        setName(doc.data().name);
                        setCP(doc.data().codigo_postal);
                        setNeighborhood(doc.data().neighborhood);
                        setCountry(doc.data().country);
                        setState({ value: doc.data().state, label: states[doc.data().state] });
                        setStreetNumber(doc.data().street_number);
                        setPlaceRef(doc.data().place_reference);
                        setPhone(doc.data().phone);
                        setCheckBox(false);
                    } else {
                        console.log('No such document!');
                    }
                })
                .catch(function(error) {
                    console.log('Error getting document:', error);
                });
        }
    }, [value]);

    //Se obtiene el nombre del usuario
    useEffect(() => {
        if (user) {
            db.collection('profiles')
                .where('ID', '==', user.uid)
                .get()
                .then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                        setUserName(doc.data().name);
                        setStatus(doc.data().status);
                    });
                })
                .catch(function(error) {
                    console.log('Error getting documents: ', error);
                });
        }
    }, []);
    const registerDirecction = () => {
        if (
            name.trim() === '' ||
            CP.trim() === '' ||
            neighborhood.trim() === '' ||
            country.trim() === '' ||
            state.value.trim() === '' ||
            streetNumber.trim() === '' ||
            placeRef.trim() === '' ||
            phone.trim() === ''
        ) {
            // (Alert)console.log('Espacios vacios');
            setError(true);
            return;
        } else {
            setError(false);
        }

        if (status !== 'Aprobado') {
            setErrorCredits(true);
            return;
        }

        if (checkBox) {
            const duplicateName = directionData.map((searchName, idx) => {
                return searchName.name;
            });
            if (duplicateName.includes(name)) {
                console.log('Necesitas poner un nombre diferente');
                return;
            }

            const directionsCollectionAdd = db.collection('sender_addresses').add({
                name,
                codigo_postal: CP,
                neighborhood,
                country,
                state: state.value,
                street_number: streetNumber,
                place_reference: placeRef,
                phone,
                ID: user.uid,
                creation_date: creationDate.toLocaleDateString(),
            });

            directionsCollectionAdd
                .then(function(docRef) {
                    console.log('Document written with ID (origen): ', docRef.id);
                })
                .catch(function(error) {
                    console.error('Error adding document: ', error);
                });
        }

        const directionsGuiasCollectionAdd = db.collection('guia').add({
            ID: user.uid,
            name: userName,
            creation_date: creationDate.toLocaleDateString(),
            status: 'incomplete',
            sender_addresses: {
                name,
                codigo_postal: CP,
                neighborhood,
                country,
                state: state.value,
                street_number: streetNumber,
                place_reference: placeRef,
                phone,
                ID: user.uid,
                creation_date: creationDate.toLocaleDateString(),
            },
        });

        const searchDuplicate = db.collection('sender_addresses').get();

        directionsGuiasCollectionAdd
            .then(function(docRef) {
                console.log('Document written with ID (Guía): ', docRef.id);
                idGuia = docRef.id;
                console.log('Se crea y se guarda el id de la guía', idGuia);
                onSave({ idGuia });
            })
            .catch(function(error) {
                console.error('Error adding document: ', error);
            });
    };

    const search = e => {
        let keyword = e.target.value;
        setFilter(keyword);
    };

    return (
        <StyledPaneContainer>
            <StyledLeftPane>
                <h4>Mis direcciones</h4>
                <Input
                    value={filter}
                    placeholder="Buscar"
                    iconPosition="right"
                    icon={<FontAwesomeIcon icon={faSearch} />}
                    onChange={e => search(e)}
                />
                <StyledRadioGroup
                    id="radio-group-component-1"
                    options={options}
                    value={value}
                    className="rainbow-m-around_small"
                    onChange={e => setValue(e.target.value)}
                />
            </StyledLeftPane>
            <StyledRightPane>
                <h4>Dirección de origen</h4>
                <div className="rainbow-align-content_center rainbow-flex_wrap">
                    <Input
                        id="nombre"
                        label="Nombre"
                        name="nombre"
                        value={name}
                        className="rainbow-p-around_medium"
                        style={{ width: '70%' }}
                        onChange={e => setName(e.target.value)}
                    />
                    <Input
                        id="cp"
                        label="C.P."
                        name="cp"
                        value={CP}
                        className="rainbow-p-around_medium"
                        style={{ width: '30%' }}
                        onChange={e => setCP(e.target.value)}
                    />
                </div>
                <div className="rainbow-align-content_center rainbow-flex_wrap">
                    <Input
                        id="domicilio"
                        label="Nombre de la calle, número exterior e interior"
                        name="domicilio"
                        value={streetNumber}
                        className="rainbow-p-around_medium"
                        style={{ flex: '1 1' }}
                        onChange={e => setStreetNumber(e.target.value)}
                    />
                    <Input
                        id="colonia"
                        label="Colonia"
                        name="colonia"
                        value={neighborhood}
                        className="rainbow-p-around_medium"
                        style={{ flex: '1 1' }}
                        onChange={e => setNeighborhood(e.target.value)}
                    />
                </div>
                <div className="rainbow-align-content_center rainbow-flex_wrap">
                    <Input
                        id="ciudad"
                        label="Ciudad"
                        name="ciudad"
                        value={country}
                        className="rainbow-p-around_medium"
                        style={{ flex: '1 1' }}
                        onChange={e => setCountry(e.target.value)}
                    />
                    <Picklist
                        id="estado"
                        label="Estado"
                        name="estado"
                        value={state}
                        className="rainbow-p-around_medium"
                        style={{ flex: '1 1' }}
                        onChange={value => setState(value)}
                        required
                    >
                        <StatePicklistOptions />
                    </Picklist>
                </div>
                <div className="rainbow-align-content_center rainbow-flex_wrap">
                    <Input
                        id="referencia"
                        label="Referencias del Lugar"
                        name="referencia"
                        value={placeRef}
                        className="rainbow-p-around_medium"
                        style={{ flex: '2 2' }}
                        onChange={e => setPlaceRef(e.target.value)}
                    />
                    <Input
                        id="telefono"
                        label="Telefono"
                        name="telefono"
                        value={phone}
                        className="rainbow-p-around_medium"
                        style={{ flex: '2 2' }}
                        onChange={e => setPhone(e.target.value)}
                    />
                    <div style={{ flex: '1 1', textAlign: 'right' }}>
                        <CheckboxToggle
                            id="guardar"
                            label="Guardar"
                            value={checkBox}
                            onChange={e => setCheckBox(e.target.checked)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="alert-error">Todos los campos necesitan estar llenos</div>
                )}
                {errorCredits && (
                    <div className="alert-error">
                        Es necesario tener un estatus apobatorio para relizar envíos
                    </div>
                )}

                <Button
                    variant="brand"
                    className="rainbow-m-around_medium"
                    onClick={() => registerDirecction()}
                >
                    Continuar
                    <FontAwesomeIcon icon={faArrowRight} className="rainbow-m-left_medium" />
                </Button>
            </StyledRightPane>
        </StyledPaneContainer>
    );
};
