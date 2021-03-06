import React, { useState, useEffect } from 'react';
import { Input, CheckboxToggle, Button } from 'react-rainbow-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faSearch } from '@fortawesome/free-solid-svg-icons';
import * as firebase from 'firebase';
import { Link } from 'react-router-dom';
import { useFirebaseApp, useUser } from 'reactfire';
import {
    StyledLeftPane,
    StyledRightPane,
    StyledPaneContainer,
    StyledRadioGroup,
    HelpLabel,
} from './styled';
import swal from 'sweetalert2';

const numberRegex = RegExp(/^[0-9]+$/);
const numberWithDecimalRegex = RegExp(/^\d+\.?\d*$/);

const PackagingRadioOption = ({ packages }) => {
    const {
        content_description,
        content_value,
        depth,
        height,
        insurance,
        quantity,
        weight,
        width,
        name,
        realWeight,
    } = packages;

    return (
        <>
            <span>
                <b>{name}</b>
            </span>
            <p>
                Dimensiones: {height}x{width}x{depth} cm
            </p>
            <p>Peso: {realWeight ? realWeight : weight} kgs</p>
        </>
    );
};

export const PaqueteriaComponent = ({ onSave, idGuiaGlobal }) => {
    const [value, setValue] = useState(null);

    const [packageData, setPackageData] = useState([]);

    const firebase = useFirebaseApp();
    const db = firebase.firestore();
    const user = useUser();

    const [error, setError] = useState();
    const [errorNameDuplicate, setErrorNameDuplicate] = useState(false);
    const [errorName, setErrorName] = useState(false);
    const [errorHeight, setErrorHeight] = useState(false);
    const [errorWidth, setErrorWidth] = useState(false);
    const [errorDepth, setErrorDepth] = useState(false);
    const [errorWeight, setErrorWeight] = useState(false);
    const [errorContentDescription, setErrorContentDescription] = useState(false);
    const [errorContentValue, setErrorContentValue] = useState(false);
    const [errorWeightValue, setErrorWeightValue] = useState(false);
    const [errorContentValueEmpty, setErrorContentValueEmpty] = useState(false);
    const [filter, setFilter] = useState('');

    const [name, setName] = useState('');
    const [height, setHeight] = useState('');
    const [width, setWidth] = useState('');
    const [depth, setDepth] = useState('');
    const [weight, setWeight] = useState('');

    const [contentDescription, setContentDescription] = useState('');
    const [contentValue, setContentValue] = useState('');

    const [checkBox, setCheckBox] = useState(true);
    const [checkBoxSecure, setCheckBoxSecure] = useState(false);

    const creationDate = new Date();
    const optionsDate = { year: '2-digit', month: '2-digit', day: '2-digit' };
    //Se busca los datos de env??o (si hay algun env??o efectuandose)
    useEffect(() => {
        if (user) {
            if (idGuiaGlobal) {
                db.collection('guia')
                    .doc(idGuiaGlobal)
                    .get()
                    .then(function(doc) {
                        if (doc.exists) {
                            setName(doc.data().package.name);
                            setHeight(doc.data().package.height);
                            setWidth(doc.data().package.width);
                            setDepth(doc.data().package.depth);
                            setWeight(doc.data().package.weight);
                            setContentDescription(doc.data().package.content_description);
                            setCheckBox(false);
                        } else {
                            console.log('No such document!');
                        }
                    });
            }
        }
    }, [idGuiaGlobal]);

    // useEffect(() => {
    //     const reloadDirectios = () => {
    //         db.collection('package')
    //             .where('ID', '==', user.uid)
    //             .onSnapshot(handleDirections);
    //     };
    //     reloadDirectios();
    // }, []);

    // function handleDirections(snapshot) {
    //     const packageData = snapshot.docs.map(doc => {
    //         //console.log(doc.data(), doc.id);
    //         return {
    //             id: doc.id,
    //             ...doc.data(),
    //         };
    //     });
    //     setPackageData(packageData);
    // }

    // const options = packageData
    //     .filter(packages => {
    //         if (filter === null) {
    //             return packages;
    //         } else if (packages.name.includes(filter)) {
    //             return packages;
    //         }
    //     })
    //     .map(packages => {
    //         return {
    //             value: packages.id,
    //             label: <PackagingRadioOption key={packages.id} packages={packages} />,
    //         };
    //     });

    // const search = e => {
    //     let keyword = e.target.value;
    //     setFilter(keyword);
    // };

    // const checkInsurance = e => {
    //     let keyword = e.target.value;
    //     swal.fire({
    //         title: '??Est??s seguro?',
    //         text:
    //             'Al asegurar tu paquete se har?? un cargo adicional del 2% del valor + $40 de poliza',
    //         icon: 'info',
    //         showDenyButton: true,
    //         confirmButtonText: `Ok`,
    //         denyButtonText: `No asegurar`,
    //     }).then(result => {
    //         if (result.isConfirmed) {
    //             setCheckBoxSecure(keyword);
    //         } else if (result.isDenied) {
    //             setCheckBoxSecure(false);
    //         }
    //     });
    // };

    useEffect(() => {
        if (value) {
            const docRef = db.collection('package').doc(value);
            docRef
                .get()
                .then(function(doc) {
                    if (doc.exists) {
                        setName(doc.data().name);
                        setHeight(doc.data().height);
                        setWidth(doc.data().width);
                        setDepth(doc.data().depth);
                        setWeight(
                            doc.data().realWeight ? doc.data().realWeight : doc.data().weight,
                        );
                        setContentDescription(doc.data().content_description);
                        setCheckBox(false);
                    } else {
                        // doc.data() will be undefined in this case
                        console.log('No such document!');
                    }
                })
                .catch(function(error) {
                    console.log('Error getting document:', error);
                });
        }
    }, [value]);

    const registerDirecction = () => {
        //console.log('creationDate', creationDate);
        if (name.trim() === '') {
            setError(true);
            setErrorName(true);
            return;
        } else {
            setErrorName(false);
        }
        if (height.trim() === '' || !numberRegex.test(height) || height <= 0) {
            setError(true);
            setErrorHeight(true);
            return;
        } else {
            setErrorHeight(false);
        }
        if (width.trim() === '' || !numberRegex.test(width) || width <= 0) {
            setError(true);
            setErrorWidth(true);
            return;
        } else {
            setErrorWidth(false);
        }
        if (depth.trim() === '' || !numberRegex.test(depth) || depth <= 0) {
            setError(true);
            setErrorDepth(true);
            return;
        } else {
            setErrorDepth(false);
        }
        if (weight === '' || !numberWithDecimalRegex.test(weight)) {
            swal.fire('??Oh no!', 'Parece que no hay un pes?? v??lido', 'error');
            setError(true);
            setErrorWeight(true);
            return;
        } else if (weight > 70) {
            swal.fire('??Oh no!', 'Por el momento no puedes enviar m??s de 70 kg', 'error');
            setError(true);
            setErrorWeight(true);
            return;
        } else {
            setErrorWeight(false);
        }
        if (contentDescription.trim() === '') {
            setError(true);
            setErrorContentDescription(true);
            return;
        } else {
            setErrorContentDescription(false);
        }
        if (checkBoxSecure && contentValue.trim() === '') {
            setError(true);
            setErrorContentValueEmpty(true);
        } else {
            if (!checkBoxSecure) {
                setContentValue(0);
            }
            if (contentValue > 100000) {
                //console.log('El monto m??ximo para asegurar un contenido es de $100,000');
                setErrorContentValue(true);
                setErrorContentValueEmpty(false);
                return;
            }
            if (checkBox) {
                const duplicateName = packageData.map((searchName, idx) => {
                    return searchName.name;
                });
                if (duplicateName.includes(name)) {
                    setErrorNameDuplicate(true);
                    setError(false);
                    return;
                }
            }
            setErrorNameDuplicate(false);
            let pricedWeight = Math.ceil(weight);
            //console.log(pricedWeight, 'peso fisico');
            const volumetricWeight = Math.ceil((height * width * depth) / 5000);
            //console.log(volumetricWeight, 'peso volumetrico');
            const heavyWeight = Math.ceil(parseInt(height, 10) + 2 * width + 2 * depth);
            //console.log('heavyWeight', heavyWeight);
            if (volumetricWeight > weight) {
                pricedWeight = volumetricWeight;
                //console.log(pricedWeight, 'peso real');
            }

            if (volumetricWeight > 70) {
                swal.fire('??Oh no!', 'Por el momento no puedes enviar m??s de 70 kg', 'error');
                setError(true);
                setErrorHeight(true);
            }
            // else if (heavyWeight > 330) {
            //     swal.fire(
            //         '??Oh no!',
            //         'Parace que tu paquete es extra grande. ?? Podr??as revisar las medidas ?',
            //         'error',
            //     );
            //     setError(true);
            //     setErrorHeight(true);
            // }
            else {
                const packageDataToFirebase = {
                    ID: user.uid,
                    name,
                    height,
                    width,
                    depth,
                    realWeight: Math.ceil(weight),
                    weight: pricedWeight,
                    content_description: contentDescription,
                    quantity: 1,
                    content_value: contentValue,
                    creation_date: creationDate.toLocaleDateString('es-US', optionsDate),
                };

                const packageGuiaData = {
                    package: {
                        ID: user.uid,
                        name,
                        height,
                        width,
                        depth,
                        realWeight: Math.ceil(weight),
                        weight: pricedWeight,
                        content_description: contentDescription,
                        quantity: 1,
                        content_value: contentValue,
                        creation_date: creationDate.toLocaleDateString('es-US', optionsDate),
                    },
                };
                setErrorContentValue(false);
                //console.log(packageDataToFirebase, packageGuiaData);
                onSave(packageDataToFirebase, packageGuiaData, checkBox);
            }
        }
    };

    return (
        <StyledPaneContainer>
            <StyledLeftPane>
                <h4>Mis empaques</h4>
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
                <h4>Datos de empaque</h4>
                <div className="rainbow-align-content_center rainbow-flex_wrap">
                    <Input
                        id="nombre"
                        label="Nombre"
                        name="nombre"
                        value={name}
                        className={`rainbow-p-around_medium ${errorName ? 'empty-space' : ''}`}
                        style={{ flex: '1 1', minWidth: '200px' }}
                        onChange={e => setName(e.target.value)}
                    />
                    <div style={{ flex: '1 1', minWidth: '300px' }}>
                        <p style={{ textAlign: 'center' }}>Dimensiones</p>
                        <div style={{ display: 'flex' }}>
                            <Input
                                id="height"
                                name="height"
                                label="largo"
                                value={height}
                                className={`rainbow-p-around_medium ${
                                    errorHeight ? 'empty-space' : ''
                                }`}
                                style={{ width: '30%' }}
                                onChange={e => setHeight(e.target.value)}
                            />
                            <HelpLabel>x</HelpLabel>
                            <Input
                                id="width"
                                name="width"
                                label="ancho"
                                value={width}
                                className={`rainbow-p-around_medium ${
                                    errorWidth ? 'empty-space' : ''
                                }`}
                                style={{ width: '30%' }}
                                onChange={e => setWidth(e.target.value)}
                            />
                            <HelpLabel>x</HelpLabel>
                            <Input
                                id="depth"
                                name="depth"
                                label="alto"
                                value={depth}
                                className={`rainbow-p-around_medium ${
                                    errorDepth ? 'empty-space' : ''
                                }`}
                                style={{ width: '30%' }}
                                onChange={e => setDepth(e.target.value)}
                            />
                            <HelpLabel>cm</HelpLabel>
                        </div>
                    </div>
                </div>
                <div className="rainbow-align-content_center rainbow-flex_wrap">
                    <Input
                        id="peso"
                        label="Peso"
                        name="peso"
                        value={weight}
                        className={`rainbow-p-around_medium ${errorWeight ? 'empty-space' : ''}`}
                        style={{ flex: '1 1' }}
                        onChange={e => setWeight(e.target.value)}
                    />
                    <HelpLabel>kgs</HelpLabel>
                    <Input
                        id="contenido"
                        label="Descripci??n del Contenido"
                        name="contenido"
                        value={contentDescription}
                        className={`rainbow-p-around_medium ${
                            errorContentDescription ? 'empty-space' : ''
                        }`}
                        style={{ flex: '1 1' }}
                        onChange={e => setContentDescription(e.target.value)}
                    />
                </div>
                <div className="rainbow-align-content_center  rainbow-flex_wrap content-value">
                    <CheckboxToggle
                        id="asegurar"
                        label="??Desea asegurar?"
                        style={{
                            display: 'flex',
                            flexDirection: 'column-reverse',
                        }}
                        className="checkbox-toggle"
                        // style={{ flex: '1 1' }}
                        value={checkBoxSecure}
                        onChange={e => checkInsurance(e)}
                    />
                    {checkBoxSecure ? (
                        <Input
                            id="valor"
                            label="Valor del Contenido"
                            name="valor"
                            className={`rainbow-p-around_medium ${
                                errorContentValueEmpty ? 'empty-space' : ''
                            }`}
                            style={{ flex: '1 1' }}
                            onChange={e => setContentValue(e.target.value)}
                        />
                    ) : (
                        <Input
                            id="valor"
                            label="Valor del Contenido"
                            name="valor"
                            value="0"
                            className="rainbow-p-around_medium"
                            style={{ display: 'none' }}
                            onChange={e => setContentValue(e.target.value)}
                        />
                    )}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <CheckboxToggle
                        id="guardar"
                        label="Guardar"
                        value={checkBox}
                        onChange={e => setCheckBox(e.target.checked)}
                    />
                </div>

                {errorNameDuplicate && (
                    <div className="pl-4">
                        <span className="alert-error">El nombre ya se encuentra registrado</span>
                    </div>
                )}
                {error && <div className="alert-error pl-4">Corregir los campos marcados</div>}
                {errorContentValue && (
                    <div className="alert-error">
                        El monto m??ximo para asegurar un contenido es de $100,000
                    </div>
                )}
                {errorWeightValue && (
                    <div className="alert-error">Por el momento no puedes enviar mas de 15 kg</div>
                )}
                <Button
                    variant="brand"
                    className="rainbow-m-around_medium"
                    onClick={registerDirecction}
                >
                    Continuar
                    <FontAwesomeIcon icon={faArrowRight} className="rainbow-m-left_medium" />
                </Button>
                <Link
                    className="link-package"
                    to="/mi-cuenta/empaques"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <p>Toma en cuenta las siguientes recomendaciones para tus paquetes</p>
                </Link>
            </StyledRightPane>
        </StyledPaneContainer>
    );
};
