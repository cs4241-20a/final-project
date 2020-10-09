import React from 'react'
import { Button, Form, FormGroup, Input, Container } from 'reactstrap'
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator'


export default class Home extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            columns: [{ dataField: 'title', text: 'Songs in Common'}],
            songs: [{ id: 0, title: "song0" }, { id: 1, title: "song1" }, { id: 2, title: "song2" }, { id: 3, title: "song3" }, { id: 4, title: "song4" }, { id: 5, title: "song5" }, { id: 6, title: "song6" }, { id: 7, title: "song7" }, { id: 8, title: "song8" }, { id: 9, title: "song9" }, { id: 10, title: "song10" }, { id: 11, title: "song11" }, { id: 12, title: "song12" }, { id: 13, title: "song13"}]
        }
    }

    render () {
        return (
            <Container>

                <h1 className="mt-5 mb-10">Application Name</h1>

                <div className="mt-5 mb-10">
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
                </div>

                <div className="mt-5 mb-10">
                    <BootstrapTable keyField='id' data={ this.state.songs } columns={ this.state.columns } pagination={ paginationFactory() } bootstrap4={true} />
                </div>


            </Container>
        )
    }

}
