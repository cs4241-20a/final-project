import React from 'react'
import { Button, Form, FormGroup, Input, Container, Table } from 'reactstrap'


export default class Home extends React.Component {
    render () {
        return (
            <Container>

                <h1 className="mt-5 mb-5">Application Name</h1>

                <Form>
                    <FormGroup>
                        <Input type="text" placeholder="login_username else placeholder text" className="form-control" required></Input>
                    </FormGroup>                    
                    <FormGroup>
                        <Input type="text" placeholder="Enter another username" className="form-control" required></Input>
                    </FormGroup>
                    <FormGroup>
                        <Button className="btn btn-primary btn-lg btn-block">Compare data</Button>
                    </FormGroup>
                </Form>

                <div>
                    <Table bordered>
                        <thead>
                            <tr>
                            <th>Songs in Common</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <td>Party in the USA</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>

            </Container>
        )
    }
}
