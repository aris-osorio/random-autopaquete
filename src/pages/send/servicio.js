import React, { useState, useEffect, useRef } from 'react';
import PropTypes, { element } from 'prop-types';
import { Card, Button, Spinner } from 'react-rainbow-components';
import styled from 'styled-components';
import { useUser, useFirebaseApp } from 'reactfire';
import formatMoney from 'accounting-js/lib/formatMoney';
import toFixed from 'accounting-js/lib/toFixed';
import { StyledPaneContainer, StyledDirectiosDetails, StyledDetails, StyledError } from './styled';

const PriceContainer = styled.div`
    display: flex;
    margin-bottom: 0.5rem;
    flex-direction: row;
    width: 50%;
    min-width: 170px;
    font-size: 0.75rem;
    color: #000;
`;

const PriceLabel = styled.div`
    display: flex;
    flex-basis: 100%;
    font-weight: bold;
`;

const PriceNumber = styled.div`
    text-align: right;
`;

const LogoSpinner = styled.div`
    border: 1px solid black;
`;

export const ServicioComponent = ({ onSave, idGuiaGlobal }) => {
    const [hasActivatedSuppliers, setHasActivatedSuppliers] = useState(null);
    const [supplierAvailability, setSupplierAvailability] = useState(false);

    const [supplierCostFedexDiaS, setSupplierCostFedexDiaS] = useState(false);
    const [supplierCostFedexEcon, setSupplierCostFedexEcon] = useState(false);

    const [supplierCostEstafetaDiaS, setSupplierCostEstafetaDiaS] = useState(false);
    const [supplierCostEstafetaEcon, setSupplierCostEstafetaEcon] = useState(false);

    const [supplierCostAutoencargosExp, setSupplierCostAutoencargosExp] = useState(false);
    const [supplierCostAutoencargosEcon, setSupplierCostAutoencargosEcon] = useState(false);

    const user = useUser();
    const firebase = useFirebaseApp();
    const db = firebase.firestore();

    // Sender states
    const [nameSender, setNameSender] = useState();
    const [CPSender, setCPSender] = useState('');
    const getCPSender = useRef('');
    const cpsAvailabilityAutoencargos = useRef(false);
    const [neighborhoodSender, setNeighborhoodSender] = useState('');
    const [countrySender, setCountrySender] = useState('');
    const [streetNumberSender, setStreetNumberSender] = useState('');
    const [phoneSender, setPhoneSender] = useState('');
    // Receiver states
    const [nameReceiver, setNameReceiver] = useState();
    const [CPReceiver, setCPReceiver] = useState('');
    const getCPReceiver = useRef('');
    const [neighborhoodReceiver, setNeighborhoodReceiver] = useState('');
    const [countryReceiver, setCountryReceiver] = useState('');
    const [streetNumberReceiver, setStreetNumberReceiver] = useState('');
    const [phoneReceiver, setPhoneReceiver] = useState('');
    // Package information
    const [namePackage, setNamePackage] = useState('');
    const [height, setHeight] = useState('');
    const [width, setWidth] = useState('');
    const [depth, setDepth] = useState('');
    const [weight, setWeight] = useState('');
    const [quantity, setQuantity] = useState('');
    const [contentValue, setContentValue] = useState('');
    const [error, setError] = useState(false);

    const [profileDoc, setProfileDoc] = useState(false);

    let OtherCpsZMG = [
        '44009',
        '44228',
        '44229',
        '44638',
        '44639',
        '44659',
        '45013',
        '45206',
        '45207',
        '45414',
        '45416',
        '45419',
        '45640',
        '45643',
        '45645',
        '45647',
    ];

    let notCoverCpsZMG = [
        '45200',
        '45220',
        '45221',
        '45226',
        '45242',
        '45245',
        '45415',
        '45424',
        '45426',
        '45427',
        '45428',
        '45429',
        '45626',
        '45627',
    ];

    const registerService = (supplier, type, { id, precio, ...cargos }) => {
        console.log('id', id);
        const precioNeto = precio * 1.16;
        console.log('precioNeto', precioNeto, precio);
        db.collection('profiles')
            .where('ID', '==', user.uid)
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    console.log(doc.id, ' => ', doc.data());
                    console.log(idGuiaGlobal, 'idGuiaGlobal');
                    if (parseFloat(precioNeto) > parseFloat(doc.data().saldo)) {
                        setError(true);
                    } else if (supplier === 'autoencargos') {
                        console.log('restando el saldo para autoencargos');
                        addRastreoAuto(idGuiaGlobal);
                        const newBalance = parseFloat(doc.data().saldo) - parseFloat(precioNeto);
                        console.log('newBalance', newBalance);
                        console.log('precioNeto', precioNeto);
                        db.collection('profiles')
                            .doc(doc.id)
                            .update({ saldo: newBalance })
                            .then(() => {
                                console.log('get it');
                                addSupplier(supplier, type, { id, precio, ...cargos });
                            });
                    } else {
                        console.log('precioNeto', precioNeto);
                        addSupplier(supplier, type, { id, precioNeto, ...cargos });
                    }
                });
            })
            .catch(function(error) {
                console.log('Error getting documents: ', error);
            });
    };

    const addSupplier = (supplier, type, { id, precioNeto, ...cargos }) => {
        console.log('precioNeto', precioNeto);
        db.collection('profiles')
            .where('ID', '==', user.uid)
            .get()
            .then(profile => {
                profile.docs[0].ref
                    .collection('rate')
                    .doc(id)
                    .get()
                    .then(doc => {
                        setError(false);
                        const tarifa = doc.data();
                        const supplierData = {
                            ID: user.uid,
                            Supplier: `${supplier}${type}`,
                            Supplier_cost: toFixed(precioNeto, 2),
                            tarifa,
                            cargos,
                        };
                        console.log(supplierData.Supplier_cost);
                        onSave(supplierData);
                    });
            });
    };

    const addRastreoAuto = idGuiaGlobal => {
        let guiaAutoencargos = Math.floor(Math.random() * 1000000).toString();
        db.collection('guia')
            .doc(idGuiaGlobal)
            .update({ rastreo: guiaAutoencargos });
    };

    useEffect(() => {
        console.log('primer useEffect');
        user.getIdToken().then(idToken => {
            const xhr = new XMLHttpRequest();
            xhr.responseType = 'json';
            xhr.contentType = 'application/json';
            //xhr.open('POST', '/guia/cotizar');
            xhr.open(
                'POST',
                'https://cors-anywhere.herokuapp.com/https://us-central1-autopaquete-92c1b.cloudfunctions.net/cotizarGuia',
            );
            xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
            xhr.send(JSON.stringify({ guiaId: idGuiaGlobal }));
            xhr.onreadystatechange = () => {
                console.log('la wea weona', xhr.readyState);
                if (xhr.readyState === 4) {
                    console.log('la wea weona llego', xhr.response);
                    //Asigna a supplierAvailability el objeto de respuesta de la funcion cotizar guia
                    //setSupplierAvailability(xhr.response);
                    let suppliersGeneral = xhr.response;
                    let autoencargos;
                    if (cpsAvailabilityAutoencargos.current === true) {
                        console.log('aqui si hay autoencargos');
                        autoencargos = {
                            autoencargosExpress: true,
                            autoencargosDiaSiguiente: true,
                        };
                    } else {
                        console.log('aqui no hay autoencargos');
                        autoencargos = {
                            autoencargosExpress: false,
                            autoencargosDiaSiguiente: false,
                        };
                    }
                    setSupplierAvailability({ ...suppliersGeneral, ...autoencargos });
                    console.log('setSupplierAvailability', supplierAvailability);
                    //{fedexEconomico: true, fedexDiaSiguiente: true, estafetaEconomico: true, estafetaDiaSiguiente: true}
                }
            };
        });
    }, []);

    useEffect(() => {
        console.log('segundo useEffect');
        //Asignando los valores desde el doc guia del firestore
        db.collection('guia')
            .doc(idGuiaGlobal)
            .onSnapshot(function getGuia(doc) {
                // Get snapshot sender information
                setNameSender(doc.data().sender_addresses.name);
                setCPSender(doc.data().sender_addresses.codigo_postal);
                getCPSender.current = doc.data().sender_addresses.codigo_postal;
                setNeighborhoodSender(doc.data().sender_addresses.neighborhood);
                setCountrySender(doc.data().sender_addresses.country);
                setStreetNumberSender(doc.data().sender_addresses.street_number);
                setPhoneSender(doc.data().sender_addresses.phone);
                // Get snapshot to receive Receiver information
                setNameReceiver(doc.data().receiver_addresses.name);
                setCPReceiver(doc.data().receiver_addresses.codigo_postal);
                getCPReceiver.current = doc.data().receiver_addresses.codigo_postal;
                setNeighborhoodReceiver(doc.data().receiver_addresses.neighborhood);
                setCountryReceiver(doc.data().receiver_addresses.country);
                setStreetNumberReceiver(doc.data().receiver_addresses.street_number);
                setPhoneReceiver(doc.data().receiver_addresses.phone);
                // Get snapshot to receive package information
                if (doc.data().package) {
                    setNamePackage(doc.data().package.name);
                    setHeight(doc.data().package.height);
                    setWidth(doc.data().package.width);
                    setDepth(doc.data().package.depth);
                    setWeight(doc.data().package.weight);
                    setQuantity(doc.data().package.quantity);
                    setContentValue(doc.data().package.content_value);
                }
                //Si el código postal coincide con los códigos postales de Autoencargos se agrega al supplierAvailability
            });
    }, []);

    useEffect(() => {
        console.log('corroborando codigo para autoencargos');
        Promise.all([
            fetch(
                'https://api-sepomex.hckdrk.mx/query/search_cp_advanced/Jalisco?municipio=Guadalajara',
            ),
            fetch(
                'https://api-sepomex.hckdrk.mx/query/search_cp_advanced/Jalisco?municipio=Zapopan',
            ),
            fetch(
                'https://api-sepomex.hckdrk.mx/query/search_cp_advanced/Jalisco?municipio=Tonalá',
            ),
            fetch(
                'https://api-sepomex.hckdrk.mx/query/search_cp_advanced/Jalisco?municipio=San Pedro Tlaquepaque',
            ),
        ])
            .then(([res1, res2, res3, res4]) =>
                Promise.all([res1.json(), res2.json(), res3.json(), res4.json()]),
            )
            .then(result => {
                let resultZMG = result.map(element => element.response.cp).flat();
                let allZMG = [...resultZMG, ...OtherCpsZMG];
                //console.log(allZMG);
                let allCpsZMG = allZMG.filter(item => {
                    return !notCoverCpsZMG.includes(item);
                });
                //console.log('allCpsZMG', allCpsZMG);
                let cpReceiver = allCpsZMG.includes(getCPReceiver.current);
                let cpSender = allCpsZMG.includes(getCPSender.current);
                if (cpReceiver === true && cpSender === true) {
                    console.log('codigos postales ZMG');
                    cpsAvailabilityAutoencargos.current = true;
                } else {
                    console.log('codigos no postales ZMG');
                    cpsAvailabilityAutoencargos.current = false;
                }
            })
            .catch(err => console.log('error', err));
    }, []);

    useEffect(() => {
        console.log('tercer useEffect');
        db.collection('profiles')
            .where('ID', '==', user.uid)
            .get()
            .then(profile => {
                setProfileDoc(profile.docs[0]);
                profile.docs[0].ref.collection('rate').onSnapshot(querySnapshot => {
                    //setHasActivatedSuppliers asigna a hasActivatedSuppliers el numero de doc de rate para que se muestren los provedores
                    setHasActivatedSuppliers(querySnapshot.size > 0);
                    console.log('querySnapshot.size', querySnapshot.size);
                });
            });
    }, [user]);

    useEffect(() => {
        if (weight === '') return;
        if (!supplierAvailability || !profileDoc) return;
        console.log('supplierAvailability', supplierAvailability);
        let pricedWeight = Math.ceil(weight);
        //Si el peso es menor que uno, se le asigna 1
        pricedWeight = pricedWeight > 1 ? pricedWeight : 1;
        const volumetricWeight = Math.ceil((height * width * depth) / 5000);
        console.log(
            'precio peso fisico',
            pricedWeight,
            'precio peso volumetrico',
            volumetricWeight,
        );
        if (volumetricWeight > weight) {
            console.log('el peso volumetrico es mayor que el peso declarado');
            pricedWeight = volumetricWeight;
        }

        const getInsurancePrice = company => {
            if (contentValue === '') return 0;
            const baseValue = parseInt(contentValue, 10) * 0.02;
            console.log('valor asegurado ', baseValue);
            const extraValue = 40;
            if (company === 'fedexDiaSiguiente' || company === 'fedexEconomico') {
                return baseValue + extraValue;
            }
            if (company === 'estafetaDiaSiguiente' || company === 'estafetaEconomico') {
                return Math.max(baseValue, 20);
            }
            if (company === 'autoencargosExpress' || company === 'autoencargosDiaSiguiente') {
                return Math.max(baseValue, 20);
            }
            return 0;
        };

        profileDoc.ref.collection('rate').onSnapshot(querySnapshot => {
            const segundaMejorTarifa = {};
            console.log('segundaMejorTarifa', segundaMejorTarifa);
            const kgsExtraTarifas = {};
            console.log('kgsExtraTarifas', kgsExtraTarifas);
            querySnapshot.forEach(doc => {
                const { entrega, precio, max, min, kgExtra } = doc.data();
                console.log(
                    'entrega',
                    entrega,
                    'precio',
                    precio,
                    'max',
                    max,
                    'min',
                    min,
                    'kgExtra',
                    kgExtra,
                );
                // Encontramos si hay tarifas que apliquen directo al paquete
                if (
                    !kgExtra &&
                    parseInt(min, 10) <= parseInt(pricedWeight, 10) &&
                    parseInt(max, 10) >= parseInt(pricedWeight, 10)
                ) {
                    console.log('Encontramos si hay tarifas que apliquen directo al paquete');
                    const precioTotal = parseInt(precio, 10) * quantity;
                    console.log('precioTotal', precioTotal);
                    if (entrega === 'fedexDiaSiguiente')
                        setSupplierCostFedexDiaS({
                            id: doc.id,
                            precio:
                                precioTotal +
                                getInsurancePrice('fedexDiaSiguiente') +
                                (typeof supplierAvailability.fedexDiaSiguiente.zonaExtendida !==
                                'undefined'
                                    ? 150
                                    : 0),
                            seguro: getInsurancePrice('fedexDiaSiguiente'),
                            guia: precioTotal,
                            zonaExt: !!supplierAvailability.fedexDiaSiguiente.zonaExtendida,
                        });
                    if (entrega === 'fedexEconomico')
                        setSupplierCostFedexEcon({
                            id: doc.id,
                            precio:
                                precioTotal +
                                getInsurancePrice('fedexEconomico') +
                                (typeof supplierAvailability.fedexEconomico.zonaExtendida !==
                                'undefined'
                                    ? 150
                                    : 0),
                            seguro: getInsurancePrice('fedexEconomico'),
                            guia: precioTotal,
                            zonaExt: !!supplierAvailability.fedexEconomico.zonaExtendida,
                        });
                    if (entrega === 'estafetaDiaSiguiente')
                        setSupplierCostEstafetaDiaS({
                            id: doc.id,
                            precio:
                                precioTotal +
                                getInsurancePrice('estafetaDiaSiguiente') +
                                (typeof supplierAvailability.estafetaDiaSiguiente.zonaExtendida !==
                                'undefined'
                                    ? 150
                                    : 0),
                            seguro: getInsurancePrice('estafetaDiaSiguiente'),
                            guia: precioTotal,
                            zonaExt: !!supplierAvailability.estafetaDiaSiguiente.zonaExtendida,
                        });
                    if (entrega === 'estafetaEconomico')
                        setSupplierCostEstafetaEcon({
                            id: doc.id,
                            precio:
                                precioTotal +
                                getInsurancePrice('estafetaEconomico') +
                                (typeof supplierAvailability.estafetaEconomico.zonaExtendida !==
                                'undefined'
                                    ? 150
                                    : 0),
                            seguro: getInsurancePrice('estafetaEconomico'),
                            guia: precioTotal,
                            zonaExt: !!supplierAvailability.estafetaEconomico.zonaExtendida,
                        });
                    if (entrega === 'autoencargosExpress')
                        setSupplierCostAutoencargosExp({
                            id: doc.id,
                            precio:
                                precioTotal +
                                getInsurancePrice('autoencargosExpress') +
                                (typeof supplierAvailability.autoencargosExpress.zonaExtendida !==
                                'undefined'
                                    ? 150
                                    : 0),
                            seguro: getInsurancePrice('autoencargosExpress'),
                            guia: precioTotal,
                            zonaExt: !!supplierAvailability.autoencargosExpress.zonaExtendida,
                        });
                    if (entrega === 'autoencargosDiaSiguiente')
                        setSupplierCostAutoencargosEcon({
                            id: doc.id,
                            precio:
                                precioTotal +
                                getInsurancePrice('autoencargosDiaSiguiente') +
                                (typeof supplierAvailability.autoencargosDiaSiguiente
                                    .zonaExtendida !== 'undefined'
                                    ? 150
                                    : 0),
                            seguro: getInsurancePrice('autoencargosDiaSiguiente'),
                            guia: precioTotal,
                            zonaExt: !!supplierAvailability.autoencargosDiaSiguiente.zonaExtendida,
                        });
                    return;
                }
                //Si la tarifa incluye precio por kg extra
                // Anotamos los cargos de kg extra, por si los necesitamos
                if (kgExtra) {
                    console.log('entrando a kg extra');
                    kgsExtraTarifas[entrega.slice(0, entrega.indexOf('Extra'))] = parseInt(
                        kgExtra,
                        10,
                    );
                    console.log('kgsExtraTarifas', kgsExtraTarifas);
                    return;
                }

                // Si el mínimo de kgs de la tarifa es mayor al peso, no aplica
                //Por ejemplo, si el min de rango es de 20 y el peso es de 19, no se puede cotizar
                if (parseInt(min, 10) > parseInt(pricedWeight, 10)) {
                    console.log('Si el mínimo de kgs de la tarifa es mayor al peso, no aplica');
                    return;
                }

                // Esto ocurre si el máximo es menor y el mínimo es menor que el peso,
                // es decir, nos sobran kilos
                //Si los rangos de la tarifa tanto maximo como minimo son menores que el peso, hay kilos extra

                const diferencia = (parseInt(pricedWeight, 10) - parseInt(max, 10)) * quantity;
                console.log('diferencia', diferencia);
                //si el rango maximo de la tarifa es mayor al peso
                if (parseInt(pricedWeight, 10) > parseInt(max, 10)) {
                    console.log('kilos extra');
                    if (
                        !segundaMejorTarifa[entrega] ||
                        segundaMejorTarifa[entrega].diferencia > diferencia
                    ) {
                        console.log('segundaMejorTarifa', segundaMejorTarifa);
                        const precioTotal = parseInt(precio, 10) * quantity;
                        console.log('precioTotal de entrega', precioTotal);
                        segundaMejorTarifa[entrega] = {
                            id: doc.id,
                            //  precio: precioTotal + getInsurancePrice('estafetaEconomico'),
                            guia: precioTotal,
                            //  seguro: getInsurancePrice('estafetaEconomico'),
                            diferencia,
                        };
                        return;
                    }
                    console.log('segundaMejorTarifa', segundaMejorTarifa);
                }
            });
            Object.keys(segundaMejorTarifa).forEach(entrega => {
                console.log('entrando a los objects keys');
                const tarifa = segundaMejorTarifa[entrega];
                console.log('tarifa', tarifa);
                const { guia } = tarifa;
                const precio = tarifa.guia + tarifa.diferencia * kgsExtraTarifas[entrega];
                console.log('precio', precio);
                // console.log('guia tarifa', tarifa.diferencia);
                console.log('Entrega', entrega);
                const cargoExtra = tarifa.diferencia * kgsExtraTarifas[entrega];
                console.log('cargoExtra', cargoExtra);
                if (entrega === 'fedexDiaSiguiente')
                    setSupplierCostFedexDiaS({
                        id: tarifa.id,
                        precio:
                            precio +
                            getInsurancePrice('fedexDiaSiguiente') +
                            (typeof supplierAvailability.fedexDiaSiguiente.zonaExtendida !==
                            'undefined'
                                ? 150
                                : 0),
                        seguro: getInsurancePrice('fedexDiaSiguiente'),
                        cargoExtra,
                        guia,
                        zonaExt: !!supplierAvailability.fedexDiaSiguiente.zonaExtendida,
                    });
                if (entrega === 'fedexEconomico')
                    setSupplierCostFedexEcon({
                        id: tarifa.id,
                        precio:
                            precio +
                            getInsurancePrice('fedexEconomico') +
                            (typeof supplierAvailability.fedexEconomico.zonaExtendida !==
                            'undefined'
                                ? 150
                                : 0),
                        seguro: getInsurancePrice('fedexEconomico'),
                        cargoExtra,
                        guia,
                        zonaExt: !!supplierAvailability.fedexEconomico.zonaExtendida,
                    });
                if (entrega === 'estafetaDiaSiguiente')
                    setSupplierCostEstafetaDiaS({
                        id: tarifa.id,
                        precio:
                            precio +
                            getInsurancePrice('estafetaDiaSiguiente') +
                            (typeof supplierAvailability.estafetaDiaSiguiente.zonaExtendida !==
                            'undefined'
                                ? 150
                                : 0),
                        seguro: getInsurancePrice('estafetaDiaSiguiente'),
                        cargoExtra,
                        guia,
                        zonaExt: !!supplierAvailability.estafetaDiaSiguiente.zonaExtendida,
                    });
                if (entrega === 'autoencargosExpress')
                    setSupplierCostAutoencargosExp({
                        id: tarifa.id,
                        precio:
                            precio +
                            getInsurancePrice('autoencargosExpress') +
                            (typeof supplierAvailability.autoencargosExpress.zonaExtendida !==
                            'undefined'
                                ? 150
                                : 0),
                        seguro: getInsurancePrice('autoencargosExpress'),
                        cargoExtra,
                        guia,
                        zonaExt: !!supplierAvailability.autoencargosExpress.zonaExtendida,
                    });
                console.log('supplierCostAutoencargosExp', supplierCostAutoencargosExp);
                if (entrega === 'autoencargosDiaSiguiente')
                    setSupplierCostAutoencargosEcon({
                        id: tarifa.id,
                        precio:
                            precio +
                            getInsurancePrice('autoencargosDiaSiguiente') +
                            (typeof supplierAvailability.autoencargosDiaSiguiente.zonaExtendida !==
                            'undefined'
                                ? 150
                                : 0),
                        seguro: getInsurancePrice('autoencargosDiaSiguiente'),
                        cargoExtra,
                        guia,
                        zonaExt: !!supplierAvailability.autoencargosDiaSiguiente.zonaExtendida,
                    });
            });
        });
    }, [weight, quantity, contentValue, supplierAvailability, profileDoc]);

    const supplierCard = (proveedor, tipoEnvio, entrega, costos) => (
        <Card className="rainbow-flex rainbow-flex_column rainbow-align_center rainbow-justify_space-around rainbow-p-around_large rainbow-m-around_small">
            {proveedor === 'fedex' && <img src="/assets/fedex.png" alt="Fedex" />}
            {proveedor === 'estafeta' && <img src="/assets/estafeta.png" alt="Estafeta" />}
            {proveedor === 'autoencargos' && (
                <img src="/assets/autoencar.png" style={{ height: 45 }} alt="Autoencargos" />
            )}
            <h6
                style={{
                    color: 'gray',
                    fontWeight: 'bold',
                    marginTop: '2rem',
                    marginBottom: '0.5rem',
                }}
            >
                Entrega Estimada
            </h6>
            <p>{entrega}</p>
            <h6
                style={{
                    color: 'gray',
                    fontWeight: 'bold',
                    marginTop: '0.5rem',
                    marginBottom: '0.5rem',
                }}
            >
                Detalles
            </h6>
            <PriceContainer>
                <PriceLabel>Tarifa Base:</PriceLabel>
                <PriceNumber>{formatMoney(costos.guia)}</PriceNumber>
            </PriceContainer>
            {costos && (
                <>
                    {costos.cargoExtra && (
                        <PriceContainer>
                            <PriceLabel>Kg adicionales:</PriceLabel>
                            <PriceNumber>{formatMoney(costos.cargoExtra)}</PriceNumber>
                        </PriceContainer>
                    )}
                    {costos.seguro > 0 && (
                        <PriceContainer>
                            <PriceLabel>Cargo por Seguro:</PriceLabel>
                            <PriceNumber>{formatMoney(costos.seguro)}</PriceNumber>
                        </PriceContainer>
                    )}
                    {costos.zonaExt && (
                        <PriceContainer>
                            <PriceLabel>Zona Extendida:</PriceLabel>
                            <PriceNumber>{formatMoney(150)}</PriceNumber>
                        </PriceContainer>
                    )}
                    <br />
                    <PriceContainer>
                        <PriceLabel>Subtotal:</PriceLabel>
                        <PriceNumber>{formatMoney(costos.precio)}</PriceNumber>
                    </PriceContainer>
                    <PriceContainer>
                        <PriceLabel>IVA:</PriceLabel>
                        <PriceNumber>{formatMoney(costos.precio * 0.16)}</PriceNumber>
                    </PriceContainer>
                    <h3> {formatMoney(costos.precio * 1.16)} </h3>
                    <Button
                        label="Elegir"
                        variant="brand"
                        onClick={() => registerService(proveedor, tipoEnvio, costos)}
                    />
                </>
            )}
        </Card>
    );
    // console.log(supplierCostFedexDiaS);
    return (
        <>
            <StyledDirectiosDetails style={{ justifyContent: 'center' }}>
                <StyledDetails>
                    <span>
                        <b>{nameSender}</b>
                    </span>
                    <p>{streetNumberSender}</p>
                    <p>{neighborhoodSender}</p>
                    <p>{countrySender}</p>
                    <p>{CPSender}</p>
                    <p>{phoneSender}</p>
                </StyledDetails>
                <StyledDetails>
                    <span>
                        <b>{nameReceiver}</b>
                    </span>
                    <p>{streetNumberReceiver}</p>
                    <p>{neighborhoodReceiver}</p>
                    <p>{countryReceiver}</p>
                    <p>{CPReceiver}</p>
                    <p>{phoneReceiver}</p>
                </StyledDetails>
                <StyledDetails>
                    <span>
                        <b>{namePackage}</b>
                    </span>
                    <p>Cantidad: {quantity} pzas.</p>
                    <p>
                        Dimensiones: {height}x{width}x{depth} cm
                    </p>
                    <p>Peso: {weight} kgs</p>
                    {contentValue !== '' && <p>Valor asegurado: ${contentValue}</p>}
                </StyledDetails>
            </StyledDirectiosDetails>
            <StyledError>
                {error && <div className="alert-error">No tienes el saldo suficiente</div>}
            </StyledError>
            {hasActivatedSuppliers === false && (
                <h1>Ningún servicio activado, contacte a un administrador</h1>
            )}
            {hasActivatedSuppliers && !supplierAvailability && (
                <div className="rainbow-p-vertical_xx-large">
                    <h1>Obteniendo precios...</h1>
                    <div className="rainbow-position_relative rainbow-m-vertical_xx-large rainbow-p-vertical_xx-large">
                        <Spinner size="large" variant="brand">
                            <LogoSpinner />
                        </Spinner>
                    </div>
                </div>
            )}
            {hasActivatedSuppliers && supplierAvailability && (
                <>
                    <StyledPaneContainer style={{ justifyContent: 'center' }}>
                        {supplierAvailability.fedexDiaSiguiente &&
                            supplierCostFedexDiaS.guia &&
                            supplierCard(
                                'fedex',
                                'DiaSiguiente',
                                'Día Siguiente',
                                supplierCostFedexDiaS,
                            )}
                        {supplierAvailability.fedexEconomico &&
                            supplierCostFedexEcon.guia &&
                            supplierCard(
                                'fedex',
                                'Economico',
                                '3 a 5 días hábiles',
                                supplierCostFedexEcon,
                            )}
                        {supplierAvailability.estafetaDiaSiguiente &&
                            supplierCostEstafetaDiaS.guia &&
                            supplierCard(
                                'estafeta',
                                'DiaSiguiente',
                                'Día Siguiente',
                                supplierCostEstafetaDiaS,
                            )}
                        {supplierAvailability.estafetaEconomico &&
                            supplierCostEstafetaEcon.guia &&
                            supplierCard(
                                'estafeta',
                                'Economico',
                                '3 a 5 días hábiles',
                                supplierCostEstafetaEcon,
                            )}
                        {supplierAvailability.autoencargosExpress &&
                            supplierCostAutoencargosExp.guia &&
                            supplierCard(
                                'autoencargos',
                                'Express',
                                'Express',
                                supplierCostAutoencargosExp,
                            )}
                        {supplierAvailability.autoencargosDiaSiguiente &&
                            supplierCostAutoencargosEcon.guia &&
                            supplierCard(
                                'autoencargos',
                                'Economico',
                                '3 a 5 días hábiles',
                                supplierCostAutoencargosEcon,
                            )}
                    </StyledPaneContainer>
                    {!(
                        (supplierAvailability.fedexDiaSiguiente && supplierCostFedexDiaS.guia) ||
                        (supplierAvailability.fedexEconomico && supplierCostFedexEcon.guia) ||
                        (supplierAvailability.estafetaDiaSiguiente &&
                            supplierCostEstafetaDiaS.guia) ||
                        (supplierAvailability.estafetaEconomico && supplierCostEstafetaEcon.guia)
                    ) && <h1>Código Postal fuera de cobertura</h1>}
                </>
            )}
        </>
    );
};

ServicioComponent.propTypes = {
    onSave: PropTypes.func.isRequired,
    idGuiaGlobal: PropTypes.string.isRequired,
};
