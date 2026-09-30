# Optional shortcuts; package.json owns the commands used locally and in CI.
default:
    @just --list

restore:
    npm run restore

dev:
    npm start

check:
    npm run check

check-clean:
    npm run check:clean

test:
    npm test

test-server:
    npm run test:server

test-client:
    npm run test:client

test-browser:
    npm run test:browser

test-sql:
    npm run test:sql

security:
    npm run security

review:
    npm run review

review-uncommitted:
    npm run review:uncommitted

# Complete local validation; SQL/browser checks have separate infrastructure needs.
ci:
    npm run ci
