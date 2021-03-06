import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faClock,
    faEnvelope,
    faPhoneAlt,
    faLocationArrow,
    faComment,
} from '@fortawesome/free-solid-svg-icons';
import { StyledFooter } from './styled';

const Footer = () => {
    return (
        <StyledFooter>
            <img src="/assets/footer.svg" style={{ width: '100%' }} alt="autopaquete" />
            <div className="main-footer">
                <div className="container">
                    <div className="row">
                        {/* Column 1 */}
                        <div className="col">
                            <img src="assets/truck-white.png" alt="LogoFooter" />
                        </div>
                        {/* Column 2 */}
                        <div className="col">
                            <h4>Horario</h4>
                            <ul>
                                <li> Lunes - Viernes</li>
                                <li>
                                    <FontAwesomeIcon className="icon" icon={faClock} />9 am - 5 pm
                                </li>
                            </ul>
                        </div>
                        {/* Column 3 */}
                        <div className="col col3">
                            <h4>Contacto</h4>
                            <ul>
                                <li>
                                    <FontAwesomeIcon className="icon" icon={faEnvelope} />
                                    soporte.logistica1@autopaquete.com
                                </li>
                                <li>
                                    <FontAwesomeIcon className="icon" icon={faPhoneAlt} />
                                    01 (33) 1542 1033
                                </li>
                                <li>
                                    <FontAwesomeIcon className="icon" icon={faComment} />
                                    WhatsApp: +52 (33) 23 107622
                                </li>
                                <li>
                                    <FontAwesomeIcon className="icon" icon={faLocationArrow} />
                                    Guadalajara, Jalisco.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footertwo">
                <p>
                    <a href="/terminos-y-condiciones">T??rminos y Condiciones</a> |
                    <a href="/aviso-de-privacidad">Aviso de Privacidad</a>
                </p>
            </div>
        </StyledFooter>
    );
};

export default Footer;
