import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

export default function ContentCharge(props) {
    return (
        <Row className="mb-4">
            <Col className="spaceline p-0">
                <img className="lineimg" src="/assets/greyline.png" alt="" />
            </Col>
            <Col className="ml-3">
                <Row className="mb-3">
                    <h4>{props.title}</h4>
                    <p className="subtitle">{props.description}</p>
                </Row>
                <Row className="container-package">
                    <div className="container-description mb-2">
                        <p className="supplier">Fedex</p>
                        <p className="price">{props.rate1}</p>
                    </div>
                    <div className="container-description">
                        <p className="supplier">Redpack</p>
                        <p className="price">{props.rate2}</p>
                    </div>
                </Row>
            </Col>
        </Row>
    );
}
