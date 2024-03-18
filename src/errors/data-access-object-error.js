class DataAccessObjectError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DataAccessObjectError';
    }
}

export {DataAccessObjectError};