"use strict";

module.exports = {
    customers: {
        john: {
            firstName: "John",
            lastName: "Doe",
            company: "Company",
            phone: "123456789",
            email: "john.doe@example.com"
        },
        jane: {
            firstName: "Jane",
            lastName: "Doe",
            company: "Company",
            phone: "987654321",
            email: "jane.doe@example.com"
        },
    },
    bills: {
        r1: {
            date: "1988-10-04",
            reservations: []
        },
    },
    rooms: {
        a: {
            name: "A",
            maxCap: 1,
            priceSingle : 30
        },
        b: {
            name: "B",
            maxCap: 2,
            priceSingle : 15
        }
    },
    reservations: {
        a: {
            from: "2014-10-10",
            to: "2014-10-10"
        },
        b: {
            from: "2014-10-10",
            to: "2014-10-11"
        }
    }
};
