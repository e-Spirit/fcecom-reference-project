# FirstSpirit Connect for Commerce - Reference Project

This project contains the export of the reference project for FirstSpirit Connect for Commerce.

## Getting Started

Using this reference project is straightforward:
- Clone the project using Git.
- Use the FSDevTools and its functionality [fs-cli](https://docs.e-spirit.com/odfs/edocs/sync/getting-started/komponenten/command-line-to/index.html) to install the project. For further information see also section 'Installation'.

### Prerequisites

You will need a working FirstSpirit instance with administrative privileges.
> Administrative privileges are not available in the Crownpeak Cloud.

To get a working copy of FirstSpirit, please contact your Partner Manager or our [Technical Support](https://support.crownpeak.com).
In order to install the reference project on a FirstSpirit server, ensure you do have a working copy of [fs-cli](https://github.com/e-Spirit/FSDevTools).

### Installation

In order to install and work with this reference project, you will first require a copy of it:
```
git clone https://github.com/e-Spirit/fcecom-reference-project.git
```
Then replace the placeholders and use fs-cli to install a copy of it onto your local FirstSpirit server:
```
$ fs-cli \
    -h <replace_with_host>:<replace_with_port> \
    -p <replace_with_project_name> \
    -sd <replace_with_reference_project_export_path> \
    import \
    -lm *:CREATE_NEW \
    --updateExistingPermissions
```
After that the project is ready to work with.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/e-Spirit/fcecom-reference-project/tags).

## Author

[Crownpeak Technology GmbH](https://www.crownpeak.com)

## License

This project is licensed under the Apache License Version 2.0, January 2004 - see the [LICENSE](LICENSE) file for details