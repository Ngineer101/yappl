import { GetServerSideProps } from "next";
import { Publication } from "../../../models";
import axios from 'axios';

export default function PublicationPage(props: any) {
  const publication: Publication = props.publication;
  return (
    <div>
      {
        publication &&
        <div>
          <h1>{publication.name}</h1>
          <h3>{publication.description}</h3>
        </div>
      }
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context: any): Promise<any> => {
  const { publicationId } = context.params;
  try {
    const response = await axios.get(`${process.env.NEXTAUTH_URL}/api/publication/${publicationId}`);
    if (response.data)
      return {
        props: {
          publication: response.data
        }
      };
  } catch (ex) {
    return {
      props: {
        publication: null
      }
    };
  }
}
