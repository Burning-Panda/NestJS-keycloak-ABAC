import { Injectable } from "@nestjs/common";

@Injectable()
export class SecureService {
	create(createSecureDto) {
		return "This action adds a new secure";
	}

	findAll() {
		return `This action returns all secure`;
	}

	findOne(id: number) {
		return `This action returns a #${id} secure`;
	}

	update(id: number, updateSecureDto) {
		return `This action updates a #${id} secure`;
	}

	remove(id: number) {
		return `This action removes a #${id} secure`;
	}
}
